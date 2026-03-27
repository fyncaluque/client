import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService, ProviderInfo } from '../../core/services/api.service';
import { SuggestionsPanel } from '../schedule/suggestions-panel/suggestions-panel.component';
import { WeeklyPlannerComponent } from '../schedule/weekly-planner/weekly-planner.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, SuggestionsPanel, WeeklyPlannerComponent],
  template: `
    <div class="min-h-screen bg-slate-900 text-slate-100">
      <div class="max-w-[1400px] mx-auto px-4 py-6 space-y-6">
        <div class="rounded-2xl border border-slate-800 bg-slate-950 p-5">
          <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <p class="text-xs uppercase tracking-[0.2em] text-slate-400">Work schedule</p>
              <h1 class="text-2xl sm:text-3xl font-bold mt-1">Planificador semanal</h1>
              <p class="text-slate-400 text-sm mt-1">
                Vista de 7 días con calendario por horas y edición por arrastrar y soltar.
              </p>
            </div>
            <div class="flex flex-wrap gap-2">
              <a routerLink="/onboarding" class="px-4 py-2 rounded-lg border border-slate-700 text-sm hover:bg-slate-800">
                Editar perfil
              </a>
              <button
                (click)="generate()"
                class="px-4 py-2 rounded-lg bg-cyan-500 text-slate-950 font-semibold text-sm hover:bg-cyan-400 disabled:opacity-60"
                [disabled]="generating"
              >
                {{ generating ? 'Generando...' : 'Generar semana' }}
              </button>
            </div>
          </div>
        </div>

        @if (providers.length > 0) {
          <div class="rounded-2xl border border-slate-800 bg-slate-950 p-4">
            <label class="text-xs uppercase tracking-wider text-slate-400">Modelo IA</label>
            <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 mt-3">
              @for (p of providers; track p.id) {
                <button
                  (click)="selectedProvider = p.id"
                  [class]="selectedProvider === p.id
                    ? 'relative rounded-lg border border-cyan-400 bg-cyan-500/10 text-left p-3'
                    : 'relative rounded-lg border border-slate-700 hover:border-slate-600 text-left p-3'"
                >
                  @if (p.isFree) {
                    <span class="absolute top-2 right-2 text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full">
                      GRATIS
                    </span>
                  }
                  <div class="font-medium text-sm">{{ p.name }}</div>
                  <div class="text-xs text-slate-400 mt-0.5">{{ p.model }}</div>
                  <div class="text-xs text-slate-500 mt-1">{{ p.description }}</div>
                </button>
              }
            </div>
          </div>
        }

        @if (showPromptInput) {
          <div class="rounded-2xl border border-slate-800 bg-slate-950 p-4">
            <label class="text-xs uppercase tracking-wider text-slate-400">Instrucciones adicionales</label>
            <textarea
              [(ngModel)]="customPrompt"
              class="w-full mt-2 px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 focus:border-cyan-400 outline-none text-sm"
              rows="3"
              placeholder="Ej: Trabajo de 9 a 1, estudio en la noche, gym 3 veces"
            ></textarea>
            <div class="flex justify-end gap-2 mt-3">
              <button (click)="showPromptInput = false" class="px-3 py-2 rounded-lg border border-slate-700 text-sm hover:bg-slate-800">
                Cancelar
              </button>
              <button (click)="generate()" class="px-3 py-2 rounded-lg bg-cyan-500 text-slate-950 text-sm font-semibold hover:bg-cyan-400" [disabled]="generating">
                {{ generating ? 'Generando...' : 'Generar con instrucciones' }}
              </button>
            </div>
          </div>
        }

        @if (errorMessage) {
          <div class="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
            {{ errorMessage }}
          </div>
        }

        @if (!hasProfile && !generating) {
          <div class="rounded-2xl border border-slate-800 bg-slate-950 p-10 text-center">
            <div class="text-4xl mb-4">📋</div>
            <h2 class="text-xl font-bold mb-2">Completa tu perfil primero</h2>
            <p class="text-slate-400 mb-6">Necesitamos tus preferencias para construir la semana completa.</p>
            <a routerLink="/onboarding" class="px-4 py-2 rounded-lg bg-cyan-500 text-slate-950 font-semibold">Completar perfil</a>
          </div>
        }

        @if (hasProfile && currentWeek.length === 0 && !generating) {
          <div class="rounded-2xl border border-slate-800 bg-slate-950 p-10 text-center">
            <div class="text-4xl mb-4">✨</div>
            <h2 class="text-xl font-bold mb-2">Genera tu horario de lunes a domingo</h2>
            <p class="text-slate-400 mb-6">Incluye tareas, descansos y actividades ubicadas por hora.</p>
            <div class="flex justify-center gap-3">
              <button (click)="showPromptInput = true" class="px-4 py-2 rounded-lg border border-slate-700 hover:bg-slate-800">
                Con instrucciones
              </button>
              <button (click)="generate()" class="px-4 py-2 rounded-lg bg-cyan-500 text-slate-950 font-semibold hover:bg-cyan-400">
                Generar ahora
              </button>
            </div>
          </div>
        }

        @if (generating) {
          <div class="rounded-2xl border border-slate-800 bg-slate-950 p-10 text-center">
            <div class="animate-spin w-10 h-10 border-4 border-slate-700 border-t-cyan-400 rounded-full mx-auto mb-4"></div>
            <h2 class="text-xl font-bold mb-2">Generando tu horario semanal...</h2>
            <p class="text-slate-400">Usando {{ getProviderName(selectedProvider) }}</p>
          </div>
        }

        @if (currentWeek.length > 0 && !generating) {
          <div class="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-4">
            <app-weekly-planner
              [weekDays]="currentWeek"
              [selectedDay]="selectedDay"
              (selectedDayChange)="selectedDay = $event"
              (weekDaysChange)="currentWeek = $event"
              (regenerateRange)="onRegenerateBlock($event)"
            />

            <div class="space-y-4">
              <div class="rounded-2xl border border-slate-800 bg-slate-950 p-4">
                <p class="text-xs uppercase tracking-wider text-slate-500">Semana activa</p>
                <h3 class="text-lg font-semibold mt-1">{{ weekRangeLabel }}</h3>
                <p class="text-sm text-slate-400 mt-1">
                  Día seleccionado: {{ getSelectedDaySchedule()?.dayOfWeek | titlecase }}
                </p>
                <p class="text-sm text-slate-400">
                  Fecha: {{ getSelectedDaySchedule()?.date | date:'fullDate' }}
                </p>
                <div class="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <div class="rounded-lg bg-slate-900 border border-slate-800 p-2">
                    <p class="text-slate-500">Bloques</p>
                    <p class="font-semibold">{{ getSelectedDaySchedule()?.schedule?.length || 0 }}</p>
                  </div>
                  <div class="rounded-lg bg-slate-900 border border-slate-800 p-2">
                    <p class="text-slate-500">Modelo</p>
                    <p class="font-semibold truncate">{{ getProviderName(selectedProvider) }}</p>
                  </div>
                </div>
              </div>

              <app-suggestions-panel
                [suggestions]="getSelectedDaySchedule()?.suggestions || []"
                [tips]="getSelectedDaySchedule()?.tips || []"
              />

              <div class="rounded-2xl border border-slate-800 bg-slate-950 p-3 space-y-2">
                <button (click)="showPromptInput = !showPromptInput" class="w-full px-3 py-2 rounded-lg border border-slate-700 text-sm hover:bg-slate-800">
                  Regenerar con instrucciones
                </button>
                <button (click)="generate()" class="w-full px-3 py-2 rounded-lg bg-cyan-500 text-slate-950 font-semibold text-sm hover:bg-cyan-400">
                  Regenerar semana completa
                </button>
              </div>
            </div>
          </div>
        }
      </div>
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

  async onRegenerateBlock(event: { dayId: string; range: { start: string; end: string } }) {
    if (!event.dayId) return;

    this.generating = true;
    try {
      const response: any = await this.api.regeneratePartial(
        event.dayId,
        event.range
      );
      if (response?.success) {
        this.currentWeek = this.currentWeek.map((day) =>
          day.id === event.dayId
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
