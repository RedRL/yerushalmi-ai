import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import type { UploadedFileKind } from '../../shared/models/upload.model';
import { isLegacyInquiryFolderId } from '../../shared/utils/inquiry-folder.util';
import { resolveFileMimeType } from '../../shared/utils/file-type.util';

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
      const uploadResponse = await fetch(uploadUrl, {
        method,
        body: file,
        headers: { 'Content-Type': resolveFileMimeType(file) },
      });

      if (!uploadResponse.ok) {
        throw new Error('העלאת הקובץ נכשלה. נסו שוב.');
      }
    }

    const completeResponse = await firstValueFrom(
      this.http.post<CompleteUploadResponse>(`${this.baseUrl}/uploads/complete`, { storageKey }),
    );

    return completeResponse.data;
  }
}
