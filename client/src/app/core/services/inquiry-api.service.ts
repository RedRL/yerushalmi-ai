import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import type { InquiryPayload, InquiryResponse } from '../../shared/models/inquiry.model';

@Injectable({ providedIn: 'root' })
export class InquiryApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl;

  submitInquiry(payload: InquiryPayload): Observable<InquiryResponse> {
    return this.http.post<InquiryResponse>(`${this.baseUrl}/inquiries`, payload);
  }
}
