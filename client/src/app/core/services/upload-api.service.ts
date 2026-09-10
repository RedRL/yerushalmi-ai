import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import type { UploadedFileKind } from '../../shared/models/upload.model';
import { isLegacyInquiryFolderId } from '../../shared/utils/inquiry-folder.util';
import { resolveFileMimeType } from '../../shared/utils/file-type.util';
import { toHebrewUserError } from '../../shared/utils/network-error.util';

export interface InitiateUploadResponse {
  success: true;
  data: {
    storageKey: string;
    uploadUrl: string;
    method: 'PUT' | 'POST';
    expiresAt: string;
  };
}

export interface CompleteUploadResponse {
  success: true;
  data: {
    storageKey: string;
    url: string;
  };
}

/**
 * Direct-to-provider upload flow: initiate → PUT to signed URL → complete.
 * Works with Cloudflare R2 (production) and mock storage (local dev).
 */
@Injectable({ providedIn: 'root' })
export class UploadApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl;

  async registerFile(
    file: File,
    type: UploadedFileKind,
    contactName: string,
    inquiryReferenceId: string,
    inquiryFolderId?: string,
  ): Promise<{ storageKey: string; url: string }> {
    const trimmedName = contactName.trim();
    if (trimmedName.length < 2) {
      throw new Error('נא למלא את שם איש הקשר לפני שליחת הבקשה.');
    }

    if (!inquiryReferenceId.trim()) {
      throw new Error('חסר מזהה פנייה. נא לרענן את הדף ולשלוח שוב.');
    }

    const reusableFolderId =
      inquiryFolderId && !isLegacyInquiryFolderId(inquiryFolderId) ? inquiryFolderId : undefined;

    const initiateResponse = await firstValueFrom(
      this.http.post<InitiateUploadResponse>(`${this.baseUrl}/uploads/initiate`, {
        fileName: file.name,
        fileType: type,
        mimeType: resolveFileMimeType(file),
        sizeBytes: file.size,
        contactName: trimmedName,
        inquiryReferenceId: inquiryReferenceId.trim(),
        ...(reusableFolderId ? { inquiryFolderId: reusableFolderId } : {}),
      }),
    );

    const { storageKey, uploadUrl, method } = initiateResponse.data;

    if (!uploadUrl.startsWith('mock://')) {
      await putFileToSignedUrl(uploadUrl, method, file);
    }

    const completeResponse = await firstValueFrom(
      this.http.post<CompleteUploadResponse>(`${this.baseUrl}/uploads/complete`, { storageKey }),
    );

    return completeResponse.data;
  }
}

const PUT_RETRY_ATTEMPTS = 3;

async function putFileToSignedUrl(uploadUrl: string, method: 'PUT' | 'POST', file: File): Promise<void> {
  const mimeType = resolveFileMimeType(file);
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < PUT_RETRY_ATTEMPTS; attempt++) {
    try {
      const uploadResponse = await fetch(uploadUrl, {
        method,
        body: file,
        headers: { 'Content-Type': mimeType },
      });

      if (uploadResponse.ok) {
        return;
      }

      const shouldRetry = uploadResponse.status >= 500 || uploadResponse.status === 408 || uploadResponse.status === 429;
      lastError = new Error('העלאת הקובץ נכשלה. נסו שוב.');
      if (!shouldRetry) {
        throw lastError;
      }
    } catch (error) {
      if (error instanceof Error && error.message === 'העלאת הקובץ נכשלה. נסו שוב.') {
        lastError = error;
      } else {
        lastError = new Error(toHebrewUserError(error, 'לא ניתן להתחבר לשרת. בדקו את החיבור לאינטרנט ונסו שוב.'));
      }
    }

    if (attempt < PUT_RETRY_ATTEMPTS - 1) {
      await new Promise((resolve) => setTimeout(resolve, 400 * (attempt + 1)));
    }
  }

  throw lastError ?? new Error('העלאת הקובץ נכשלה. נסו שוב.');
}
