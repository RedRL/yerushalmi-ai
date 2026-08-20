import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import type { UploadedFileKind } from '../../shared/models/upload.model';
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
 * Talks to the mock storage endpoints for Milestone 1. Once a real provider
 * (Cloudflare R2 / S3 / Cloudinary) is selected, `completeUpload` will PUT the
 * file bytes directly to `uploadUrl` before calling `/uploads/complete` - no
 * backend/API changes should be required on the frontend call sites.
 */
@Injectable({ providedIn: 'root' })
export class UploadApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl;

  async registerFile(file: File, type: UploadedFileKind): Promise<{ storageKey: string; url: string }> {
    const initiateResponse = await firstValueFrom(
      this.http.post<InitiateUploadResponse>(`${this.baseUrl}/uploads/initiate`, {
        fileName: file.name,
        fileType: type,
        mimeType: resolveFileMimeType(file),
        sizeBytes: file.size,
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
