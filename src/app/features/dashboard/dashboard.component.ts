import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService, ProviderInfo } from '../../core/services/api.service';
import { ScheduleTimelineComponent } from '../schedule/schedule-timeline/schedule-timeline.component';
import { SuggestionsPanel } from '../schedule/suggestions-panel/suggestions-panel.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, ScheduleTimelineComponent, SuggestionsPanel],
  template: `
    <div class="max-w-7xl mx-auto px-4 py-8">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Tu Horario</h1>
          <p class="text-gray-500 mt-1">Genera y personaliza tu horario ideal con IA</p>
        </div>
        <div class="flex gap-3">
          <a routerLink="/onboarding" class="btn-secondary text-sm">Editar perfil</a>
          <button (click)="generate()" class="btn-primary text-sm" [disabled]="generating">
            {{ generating ? 'Generando...' : 'Generar horario' }}
          </button>
        </div>
      </div>

      <!-- Provider Selector -->
      @if (providers.length > 0) {
        <div class="card mb-6">
          <label class="label-text">Modelo de IA</label>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            @for (p of providers; track p.id) {
              <button
                (click)="selectedProvider = p.id"
                [class]="selectedProvider === p.id
                  ? 'relative p-4 rounded-lg border-2 border-indigo-500 bg-indigo-50 text-left transition-all'
                  : 'relative p-4 rounded-lg border-2 border-gray-200 hover:border-gray-300 text-left transition-all'"
              >
                @if (p.isFree) {
                  <span class="absolute top-2 right-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                    GRATIS
                  </span>
                }
                <div class="font-medium text-sm">{{ p.name }}</div>
                <div class="text-xs text-gray-500 mt-0.5">{{ p.model }}</div>
                <div class="text-xs text-gray-400 mt-1">{{ p.description }}</div>
              </button>
            }
          </div>
        </div>
      }

      <!-- Custom prompt -->
      @if (showPromptInput) {
        <div class="card mb-6">
          <label class="label-text">Instrucciones adicionales (opcional)</label>
          <textarea
            [(ngModel)]="customPrompt"
            class="input-field"
            rows="3"
            placeholder="Ej: Hoy tengo una reunión a las 3pm, quiero más tiempo para leer..."
          ></textarea>
          <div class="flex justify-end gap-3 mt-3">
            <button (click)="showPromptInput = false" class="btn-secondary text-sm">Cancelar</button>
            <button (click)="generate()" class="btn-primary text-sm" [disabled]="generating">
              {{ generating ? 'Generando...' : 'Generar con instrucciones' }}
            </button>
          </div>
        </div>
      }

      @if (errorMessage) {
        <div class="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg mb-6">
          {{ errorMessage }}
        </div>
      }

      @if (!hasProfile && !generating) {
        <div class="card text-center py-12">
          <div class="text-5xl mb-4">📋</div>
          <h2 class="text-xl font-bold mb-2">Completa tu perfil primero</h2>
          <p class="text-gray-500 mb-6">
            Necesitamos conocer tus preferencias para generar tu horario ideal.
          </p>
          <a routerLink="/onboarding" class="btn-primary">Completar perfil</a>
        </div>
      }

      @if (hasProfile && currentWeek.length === 0 && !generating) {
        <div class="card text-center py-12">
          <div class="text-5xl mb-4">✨</div>
          <h2 class="text-xl font-bold mb-2">Genera tu primer horario semanal</h2>
          <p class="text-gray-500 mb-6">
            Tu perfil está listo. Selecciona un modelo de IA y genera tu horario de lunes a domingo.
          </p>
          <div class="flex justify-center gap-3">
            <button (click)="showPromptInput = true" class="btn-secondary">
              Con instrucciones
            </button>
            <button (click)="generate()" class="btn-primary">
              Generar ahora
            </button>
          </div>
        </div>
      }

      @if (generating) {
        <div class="card text-center py-12">
          <div class="animate-spin w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full mx-auto mb-4"></div>
          <h2 class="text-xl font-bold mb-2">Generando tu horario semanal...</h2>
          <p class="text-gray-500">
            Usando {{ getProviderName(selectedProvider) }} para crear tu horario personalizado
          </p>
        </div>
      }

      @if (currentWeek.length > 0 && !generating) {
        <div class="card mb-6">
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
            <h2 class="text-lg font-bold">Semana {{ weekRangeLabel }}</h2>
            <span class="text-sm text-gray-500">
              {{ getSelectedDaySchedule()?.date | date:'fullDate' }}
            </span>
          </div>
          <div class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
            @for (day of currentWeek; track day.id) {
              <button
                (click)="selectedDay = day.dayOfWeek"
                [class]="selectedDay === day.dayOfWeek
                  ? 'px-3 py-2 rounded-lg border border-indigo-500 bg-indigo-50 text-indigo-700 text-sm font-medium'
                  : 'px-3 py-2 rounded-lg border border-gray-200 hover:border-gray-300 text-gray-700 text-sm'"
              >
                {{ day.dayOfWeek | titlecase }}
              </button>
            }
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div class="lg:col-span-2">
            <app-schedule-timeline
              [blocks]="getSelectedDaySchedule()?.schedule || []"
              (onRegenerate)="regenerateRange($event)"
            />
          </div>

          <div>
            <app-suggestions-panel
              [suggestions]="getSelectedDaySchedule()?.suggestions || []"
              [tips]="getSelectedDaySchedule()?.tips || []"
            />

            <div class="card mt-4 space-y-3">
              <button (click)="showPromptInput = !showPromptInput" class="btn-secondary w-full text-sm">
                Regenerar con instrucciones
              </button>
              <button (click)="generate()" class="btn-secondary w-full text-sm" [disabled]="generating">
                Regenerar completo
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class DashboardComponent implements OnInit {
  generating = false;
  hasProfile = false;
  showPromptInput = false;
  customPrompt = '';
  errorMessage = '';
  currentWeek: any[] = [];
  selectedDay = 'monday';
  weekRangeLabel = '';

  providers: ProviderInfo[] = [];
  selectedProvider = '';

  constructor(private api: ApiService) {}

  async ngOnInit() {
    await this.loadData();
  }

  async loadData() {
    // Load providers
    try {
      const provRes: any = await this.api.getProviders();
      if (provRes?.success && provRes.data) {
        this.providers = provRes.data;
        if (this.providers.length > 0 && !this.selectedProvider) {
          this.selectedProvider = this.providers[0].id;
        }
      }
    } catch {
      // Providers endpoint not available
    }

    // Load profile
    try {
      const profileRes: any = await this.api.getProfile();
      this.hasProfile = profileRes?.success && !!profileRes.data;
    } catch {
      this.hasProfile = false;
    }

    // Load existing schedules
    try {
      const schedulesRes: any = await this.api.getSchedules();
      if (schedulesRes?.success && schedulesRes.data?.length > 0) {
        this.setLatestWeek(schedulesRes.data);
      }
    } catch {
      // No schedules yet
    }
  }

  async generate() {
    this.generating = true;
    this.errorMessage = '';

    try {
      const response: any = await this.api.generateSchedule({
        customPrompt: this.customPrompt || undefined,
        provider: this.selectedProvider || undefined,
      });

      if (response?.success) {
        if (response.data?.days) {
          this.currentWeek = this.sortWeek(response.data.days);
          this.selectedDay = this.currentWeek[0]?.dayOfWeek || 'monday';
          this.weekRangeLabel = this.buildWeekRangeLabel(response.data.weekStart, response.data.weekEnd);
        }
        this.showPromptInput = false;
        this.customPrompt = '';
      } else {
        this.errorMessage = response?.error || 'Error generando el horario';
      }
    } catch (err: any) {
      this.errorMessage =
        err?.error?.error || 'Error generando el horario. Verifica tu configuración.';
    } finally {
      this.generating = false;
    }
  }

  async regenerateRange(range: { start: string; end: string }) {
    const selected = this.getSelectedDaySchedule();
    if (!selected?.id) return;

    this.generating = true;
    try {
      const response: any = await this.api.regeneratePartial(
        selected.id,
        range
      );
      if (response?.success) {
        this.currentWeek = this.currentWeek.map((day) =>
          day.id === selected.id
            ? {
                ...day,
                schedule: response.data.schedule,
                suggestions: response.data.suggestions,
                tips: response.data.tips,
              }
            : day
        );
      }
    } catch (err) {
      this.errorMessage = 'Error al regenerar parcialmente';
    } finally {
      this.generating = false;
    }
  }

  getSelectedDaySchedule(): any | null {
    return this.currentWeek.find((day) => day.dayOfWeek === this.selectedDay) || this.currentWeek[0] || null;
  }

  getProviderName(id: string): string {
    const p = this.providers.find((p) => p.id === id);
    return p ? `${p.name} (${p.model})` : 'IA';
  }

  private setLatestWeek(schedules: any[]) {
    const withDate = schedules.filter((s) => !!s.date);
    if (withDate.length === 0) {
      this.currentWeek = [];
      this.weekRangeLabel = '';
      return;
    }

    const sortedByDateDesc = [...withDate].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    const latestWeekKey = this.getWeekKey(sortedByDateDesc[0].date);
    const sameWeek = sortedByDateDesc.filter((s) => this.getWeekKey(s.date) === latestWeekKey);

    this.currentWeek = this.sortWeek(sameWeek);
    this.selectedDay = this.currentWeek[0]?.dayOfWeek || 'monday';

    const first = this.currentWeek[0]?.date;
    const last = this.currentWeek[this.currentWeek.length - 1]?.date;
    this.weekRangeLabel = this.buildWeekRangeLabel(first, last);
  }

  private sortWeek(days: any[]): any[] {
    const dayOrder = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    return [...days].sort(
      (a, b) => dayOrder.indexOf(a.dayOfWeek) - dayOrder.indexOf(b.dayOfWeek)
    );
  }

  private getWeekKey(dateInput: string | Date): string {
    const date = new Date(dateInput);
    date.setHours(0, 0, 0, 0);
    const day = date.getDay();
    const diffToMonday = day === 0 ? -6 : 1 - day;
    const monday = new Date(date);
    monday.setDate(date.getDate() + diffToMonday);
    return monday.toISOString().split('T')[0];
  }

  private buildWeekRangeLabel(weekStart?: string, weekEnd?: string): string {
    if (!weekStart || !weekEnd) return '';
    const start = new Date(weekStart);
    const end = new Date(weekEnd);
    return `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`;
  }
}
