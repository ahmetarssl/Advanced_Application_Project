import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, delay } from 'rxjs';
import { ChartData } from 'chart.js';
import { environment } from '../../../environments/environment';

export interface ChatResponse {
  answer: string;
  hasChart: boolean;
  chartData?: ChartData;
  sql?: string;
}

@Injectable({ providedIn: 'root' })
export class ChatService {
  private http = inject(HttpClient);

  askAi(query: string): Observable<ChatResponse> {
    return this.http.post<ChatResponse>(`${environment.apiUrl}/chat/ask`, { question: query });
  }
}
