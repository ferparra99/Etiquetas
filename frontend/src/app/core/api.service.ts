import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { CableSearchResponse, ScanResponse } from '../shared/models/api.models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);

  scan(image: Blob): Observable<ScanResponse> {
    const form = new FormData();
    form.append('file', image, 'marquilla.jpg');
    return this.http.post<ScanResponse>('/api/scan', form);
  }

  searchCable(code: string): Observable<CableSearchResponse> {
    return this.http.get<CableSearchResponse>('/api/cables/search', { params: { code } });
  }
}
