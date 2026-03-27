import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
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

      @if (hasProfile && !currentSchedule && !generating) {
        <div class="card text-center py-12">
          <div class="text-5xl mb-4">✨</div>
          <h2 class="text-xl font-bold mb-2">Genera tu primer horario</h2>
          <p class="text-gray-500 mb-6">
            Tu perfil está listo. Selecciona un modelo de IA y genera tu horario.
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
          <h2 class="text-xl font-bold mb-2">Generando tu horario...</h2>
          <p class="text-gray-500">
            Usando {{ getProviderName(selectedProvider) }} para crear tu horario personalizado
          </p>
        </div>
      }

      @if (currentSchedule && !generating) {
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Schedule Timeline -->
          <div class="lg:col-span-2">
            <app-schedule-timeline
              [blocks]="currentSchedule.schedule"
              (onRegenerate)="regenerateRange($event)"
            />
          </div>

          <!-- Suggestions Panel -->
          <div>
            <app-suggestions-panel
              [suggestions]="currentSchedule.suggestions"
              [tips]="currentSchedule.tips"
            />

            <!-- Actions -->
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

        <!-- History -->
        @if (scheduleHistory.length > 1) {
          <div class="mt-8">
            <h3 class="text-lg font-bold mb-4">Historial de horarios</h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              @for (schedule of scheduleHistory; track schedule.id) {
                <a [routerLink]="['/schedule', schedule.id]"
                  class="card hover:border-indigo-200 hover:shadow-md transition-all cursor-pointer">
                  <div class="text-sm font-medium">{{ schedule.dayOfWeek | titlecase }}</div>
                  <div class="text-xs text-gray-500">{{ schedule.date | date:'mediumDate' }}</div>
                  <div class="text-xs text-gray-400 mt-1">
                    {{ getBlockCount(schedule) }} actividades
                  </div>
                </a>
              }
            </div>
          </div>
        }
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
  currentSchedule: any = null;
  scheduleHistory: any[] = [];

  providers: ProviderInfo[] = [];
  selectedProvider = '';

  constructor(
    private api: ApiService,
    private router: Router
  ) {}

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
        this.scheduleHistory = schedulesRes.data;
        this.currentSchedule = schedulesRes.data[0];
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
        this.currentSchedule = response.data;
        this.showPromptInput = false;
        this.customPrompt = '';
        const schedulesRes: any = await this.api.getSchedules();
        if (schedulesRes?.success) {
          this.scheduleHistory = schedulesRes.data;
        }
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
    if (!this.currentSchedule?.id) return;

    this.generating = true;
    try {
      const response: any = await this.api.regeneratePartial(
        this.currentSchedule.id,
        range
      );
      if (response?.success) {
        this.currentSchedule = {
          ...this.currentSchedule,
          schedule: response.data.schedule,
          suggestions: response.data.suggestions,
          tips: response.data.tips,
        };
      }
    } catch (err) {
      this.errorMessage = 'Error al regenerar parcialmente';
    } finally {
      this.generating = false;
    }
  }

  getBlockCount(schedule: any): number {
    return Array.isArray(schedule.schedule) ? schedule.schedule.length : 0;
  }

  getProviderName(id: string): string {
    const p = this.providers.find((p) => p.id === id);
    return p ? `${p.name} (${p.model})` : 'IA';
  }
}
