import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService, ProviderInfo } from '../../core/services/api.service';
import { ThemeService } from '../../core/services/theme.service';
import { WeeklyPlannerComponent } from '../schedule/weekly-planner/weekly-planner.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, WeeklyPlannerComponent],
  template: `
    <div
      [ngClass]="
        theme.theme() === 'light'
          ? 'min-h-screen bg-[#f4f1ea] p-3 md:p-4'
          : 'min-h-screen bg-[#1d1a2e] p-3 md:p-4'
      "
    >
      @if (errorMessage) {
        <div
          class="mb-3 rounded-xl border p-3 text-sm"
          [ngClass]="
            theme.theme() === 'light'
              ? 'border-[#f2b8c6] bg-[#ffe4ec] text-[#7f1d3f]'
              : 'border-[#8b4a5c] bg-[#3d2830] text-[#f0c0d0]'
          "
        >
          {{ errorMessage }}
        </div>
      }

      @if (generating) {
        <div
          class="h-[calc(100vh-2rem)] rounded-2xl border flex items-center justify-center"
          [ngClass]="
            theme.theme() === 'light'
              ? 'border-[#d8d4f2] bg-[#f8f6ff]'
              : 'border-[#4a3f6b] bg-[#2a2438]'
          "
        >
          <div class="text-center">
            <div
              class="animate-spin w-10 h-10 border-4 rounded-full mx-auto mb-4"
              [ngClass]="
                theme.theme() === 'light'
                  ? 'border-[#d8d4f2] border-t-[#8dd3c7]'
                  : 'border-[#4a3f6b] border-t-[#8dd3c7]'
              "
            ></div>
            <p
              class="font-medium"
              [ngClass]="theme.theme() === 'light' ? 'text-[#3f3a5d]' : 'text-[#e8e4f5]'"
            >
              Generando horario semanal...
            </p>
          </div>
        </div>
      }

      @if (!generating && currentWeek.length > 0) {
        <app-weekly-planner
          [theme]="theme.theme()"
          [weekDays]="currentWeek"
          [selectedDay]="selectedDay"
          (selectedDayChange)="selectedDay = $event"
          (weekDaysChange)="currentWeek = $event"
          (regenerateRange)="onRegenerateBlock($event)"
        />
      }

      @if (!generating && currentWeek.length === 0) {
        <div
          class="h-[calc(100vh-2rem)] rounded-2xl border flex items-center justify-center"
          [ngClass]="
            theme.theme() === 'light'
              ? 'border-[#d8d4f2] bg-[#f8f6ff]'
              : 'border-[#4a3f6b] bg-[#2a2438]'
          "
        >
          <button
            type="button"
            (click)="generate()"
            class="px-6 py-3 rounded-xl font-semibold"
            [ngClass]="
              theme.theme() === 'light'
                ? 'bg-[#8dd3c7] text-[#1f2937] hover:bg-[#a8e2d8]'
                : 'bg-[#6db8a8] text-[#0f1a18] hover:bg-[#8dd3c7]'
            "
          >
            Generar horario semanal
          </button>
        </div>
      }

      <button
        type="button"
        (click)="theme.toggle()"
        class="fixed bottom-4 right-4 z-100 rounded-full px-4 py-2.5 text-sm font-medium shadow-lg border-2 transition-colors"
        [ngClass]="
          theme.theme() === 'light'
            ? 'border-[#d8d4f2] bg-[#f8f6ff] text-[#2f2a44] hover:bg-[#ece7ff]'
            : 'border-[#4a3f6b] bg-[#322b4a] text-[#e8e4f5] hover:bg-[#3d3558]'
        "
        [attr.aria-label]="theme.theme() === 'light' ? 'Activar modo oscuro' : 'Activar modo claro'"
      >
        {{ theme.theme() === 'light' ? 'Modo oscuro' : 'Modo claro' }}
      </button>
    </div>
  `,
})
export class DashboardComponent implements OnInit {
  generating = false;
  hasProfile = true;
  showPromptInput = false;
  customPrompt = '';
  errorMessage = '';
  currentWeek: any[] = [];
  selectedDay = 'monday';
  weekRangeLabel = '';

  providers: ProviderInfo[] = [];
  selectedProvider = '';

  constructor(
    private api: ApiService,
    public theme: ThemeService
  ) {}

  async ngOnInit() {
    await this.loadData();
  }

  async loadData() {
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

    try {
      const profileRes: any = await this.api.getProfile();
      this.hasProfile = profileRes?.success && !!profileRes.data;
    } catch {
      this.hasProfile = false;
    }

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
      const response: any = await this.api.regeneratePartial(event.dayId, event.range);
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
