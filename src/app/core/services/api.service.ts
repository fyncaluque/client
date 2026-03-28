import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { SupabaseService } from './supabase.service';
import { environment } from '../../../environments/environment';

export interface ProviderInfo {
  id: string;
  name: string;
  model: string;
  isFree: boolean;
  description: string;
}

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private baseUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private supabase: SupabaseService
  ) {}

  private async getHeaders(): Promise<HttpHeaders> {
    const token = await this.supabase.getAccessToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    });
  }

  // Providers
  async getProviders(): Promise<any> {
    return this.http.get(`${this.baseUrl}/providers`).toPromise();
  }

  // Profile
  async getProfile(): Promise<any> {
    const headers = await this.getHeaders();
    return this.http.get(`${this.baseUrl}/profile`, { headers }).toPromise();
  }

  async saveProfile(profile: any): Promise<any> {
    const headers = await this.getHeaders();
    return this.http.post(`${this.baseUrl}/profile`, profile, { headers }).toPromise();
  }

  // Schedule
  async generateSchedule(options?: {
    customPrompt?: string;
    date?: string;
    dayOfWeek?: string;
    provider?: string;
  }): Promise<any> {
    const headers = await this.getHeaders();
    return this.http
      .post(`${this.baseUrl}/schedule/generate`, options || {}, { headers })
      .toPromise();
  }

  async getSchedules(): Promise<any> {
    const headers = await this.getHeaders();
    return this.http.get(`${this.baseUrl}/schedule`, { headers }).toPromise();
  }

  async getSchedule(id: string): Promise<any> {
    const headers = await this.getHeaders();
    return this.http.get(`${this.baseUrl}/schedule/${id}`, { headers }).toPromise();
  }

  async regeneratePartial(
    scheduleId: string,
    timeRange: { start: string; end: string }
  ): Promise<any> {
    const headers = await this.getHeaders();
    return this.http
      .post(
        `${this.baseUrl}/schedule/regenerate-partial`,
        { scheduleId, timeRange },
        { headers }
      )
      .toPromise();
  }

  async deleteSchedule(id: string): Promise<any> {
    const headers = await this.getHeaders();
    return this.http.delete(`${this.baseUrl}/schedule/${id}`, { headers }).toPromise();
  }

  // Chat
  async sendChatMessage(body: {
    message: string;
    context: any;
    history: { role: 'user' | 'assistant'; content: string }[];
  }): Promise<{
    stream: AsyncGenerator<{ type: 'token' | 'actions'; content?: string; data?: any[] }>;
  }> {
    const token = await this.supabase.getAccessToken();

    const response = await fetch(`${this.baseUrl}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`Chat request failed: ${response.status}`);
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    async function* stream() {
      if (!reader) return;
      let buffer = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') return;
            try {
              yield JSON.parse(data);
            } catch {}
          }
        }
      }
    }

    return { stream: stream() };
  }
}
