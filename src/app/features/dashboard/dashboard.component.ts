import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService, ProviderInfo } from '../../core/services/api.service';
import { ThemeService } from '../../core/services/theme.service';
import { CalendarSkeletonComponent } from '../../shared/components/calendar-skeleton/calendar-skeleton.component';
import { FloatingChatComponent } from '../../shared/components/floating-chat/floating-chat.component';
import { WeeklyPlannerComponent } from '../schedule/weekly-planner/weekly-planner.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, WeeklyPlannerComponent, CalendarSkeletonComponent, FloatingChatComponent],
  template: `
    <div
      [ngClass]="
        theme.theme() === 'light'
          ? 'min-h-screen bg-[#f4f1ea] p-3 md:p-4'
          : 'min-h-screen bg-[#1d1a2e] p-3 md:p-4'
      "
    >
      @if (loading) {
        <app-calendar-skeleton [theme]="theme.theme()" />
      }

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

      @if (!loading && !generating && currentWeek.length > 0) {
        <app-weekly-planner
          [theme]="theme.theme()"
          [weekDays]="currentWeek"
          [selectedDay]="selectedDay"
          [profile]="profileData"
          (selectedDayChange)="selectedDay = $event"
          (weekDaysChange)="currentWeek = $event"
          (regenerateRange)="onRegenerateBlock($event)"
          (themeToggle)="theme.toggle()"
          (refreshSchedule)="loadData()"
          (editProfile)="onEditProfile($event)"
          (deleteSchedule)="onDeleteSchedule()"
        />
      }

      @if (!loading && !generating && currentWeek.length === 0) {
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
    </div>

    <app-floating-chat
      [theme]="theme.theme()"
      [profile]="profileData"
      [weekDays]="currentWeek"
      (actionsExecuted)="handleChatActions($event)"
    />
  `,
})
export class DashboardComponent implements OnInit {
  loading = true;
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
  profileData: any = null;

  constructor(
    private api: ApiService,
    public theme: ThemeService,
    private cdr: ChangeDetectorRef
  ) {}

  ensureFullWeek(): void {
    const dayNames = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const existing = new Set(this.currentWeek.map((d: any) => d.dayOfWeek));
    const monday = this.getMonday();

    for (let i = 0; i < dayNames.length; i++) {
      if (!existing.has(dayNames[i])) {
        const date = new Date(monday);
        date.setDate(monday.getDate() + i);
        this.currentWeek.push({
          id: `new-${dayNames[i]}-${Date.now()}`,
          date: date.toISOString(),
          dayOfWeek: dayNames[i],
          schedule: [],
          suggestions: [],
          tips: [],
        });
      }
    }

    this.currentWeek.sort((a: any, b: any) => dayNames.indexOf(a.dayOfWeek) - dayNames.indexOf(b.dayOfWeek));
  }

  private getMonday(): Date {
    const ref = this.currentWeek.length > 0 ? new Date(this.currentWeek[0].date) : new Date();
    ref.setHours(0, 0, 0, 0);
    const day = ref.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    ref.setDate(ref.getDate() + diff);
    return ref;
  }

  private clampBlock(block: any): any | null {
    if (!this.profileData) return block;
    const availableStart = this.timeToMinutes(this.profileData.wakeUpTime || '06:00');
    const availableEnd = this.timeToMinutes(this.profileData.bedTime || '23:00');
    const blockStart = this.timeToMinutes(block.start);
    const blockEnd = this.timeToMinutes(block.end);

    if (blockStart >= availableEnd || blockEnd <= availableStart) return null;

    return {
      ...block,
      start: this.minutesToTime(Math.max(blockStart, availableStart)),
      end: this.minutesToTime(Math.min(blockEnd, availableEnd)),
    };
  }

  private timeToMinutes(time: string): number {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
  }

  private minutesToTime(totalMinutes: number): string {
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  }

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
      if (profileRes?.success && profileRes.data) {
        this.profileData = profileRes.data;
      }
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

    this.loading = false;
    this.cdr.detectChanges();
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
      this.cdr.detectChanges();
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
      this.cdr.detectChanges();
    }
  }

  async onEditProfile(formData: any) {
    if (!this.profileData) return;
    const updatedProfile = { ...this.profileData, ...formData };
    try {
      await this.api.saveProfile(updatedProfile);
      this.profileData = updatedProfile;
    } catch {
      this.errorMessage = 'Error al guardar el perfil';
    }
    this.cdr.detectChanges();
  }

  async onDeleteSchedule() {
    if (this.currentWeek.length === 0) return;
    this.generating = true;
    try {
      for (const day of this.currentWeek) {
        if (day.id) {
          await this.api.deleteSchedule(day.id);
        }
      }
      this.currentWeek = [];
    } catch {
      this.errorMessage = 'Error al eliminar el horario';
    } finally {
      this.generating = false;
      this.cdr.detectChanges();
    }
  }

  getSelectedDaySchedule(): any | null {
    return this.currentWeek.find((day) => day.dayOfWeek === this.selectedDay) || this.currentWeek[0] || null;
  }

  async handleChatActions(actions: { type: string; data: any }[]) {
    for (const action of actions) {
      switch (action.type) {
        case 'updateTimeRange': {
          if (this.profileData) {
            const updatedProfile = { ...this.profileData, ...action.data };
            try {
              await this.api.saveProfile(updatedProfile);
              this.profileData = updatedProfile;
            } catch {
              this.errorMessage = 'Error al actualizar el horario disponible';
            }
          }
          break;
        }

        case 'updateProfile': {
          if (this.profileData) {
            const updatedProfile = { ...this.profileData, ...action.data };
            try {
              await this.api.saveProfile(updatedProfile);
              this.profileData = updatedProfile;
            } catch {
              this.errorMessage = 'Error al actualizar el perfil';
            }
          }
          break;
        }

        case 'addActivity': {
          const { days, block } = action.data;
          if (days && block) {
            this.ensureFullWeek();
            const clamped = this.clampBlock(block);
            if (clamped) {
              this.currentWeek = this.currentWeek.map((day: any) => {
                if (days.includes(day.dayOfWeek)) {
                  const newSchedule = [...(day.schedule || []), { ...clamped }];
                  newSchedule.sort((a, b) => {
                    const aMin = parseInt(a.start.split(':')[0]) * 60 + parseInt(a.start.split(':')[1]);
                    const bMin = parseInt(b.start.split(':')[0]) * 60 + parseInt(b.start.split(':')[1]);
                    return aMin - bMin;
                  });
                  return { ...day, schedule: newSchedule };
                }
                return day;
              });
            }
          }
          break;
        }

        case 'removeActivity': {
          const { activityName } = action.data;
          if (activityName && this.currentWeek.length > 0) {
            this.currentWeek = this.currentWeek.map((day) => ({
              ...day,
              schedule: (day.schedule || []).filter(
                (b: any) => !b.activity.toLowerCase().includes(activityName.toLowerCase())
              ),
            }));
          }
          break;
        }

        case 'refreshSchedule': {
          await this.loadData();
          break;
        }

        case 'deleteSchedule': {
          if (this.currentWeek.length > 0) {
            try {
              for (const day of this.currentWeek) {
                if (day.id) {
                  await this.api.deleteSchedule(day.id);
                }
              }
              this.currentWeek = [];
            } catch {
              this.errorMessage = 'Error al eliminar el horario';
            }
          }
          break;
        }

        case 'generatePlan':
        case 'generateRoutine': {
          const { blocks } = action.data;
          if (blocks) {
            this.ensureFullWeek();
            for (const blockDef of blocks) {
              const { days, ...block } = blockDef;
              if (days && block) {
                const clamped = this.clampBlock(block);
                if (clamped) {
                  this.currentWeek = this.currentWeek.map((day: any) => {
                    if (days.includes(day.dayOfWeek)) {
                      const newSchedule = [...(day.schedule || []), { ...clamped }];
                      newSchedule.sort((a: any, b: any) => {
                        const aMin = parseInt(a.start.split(':')[0]) * 60 + parseInt(a.start.split(':')[1]);
                        const bMin = parseInt(b.start.split(':')[0]) * 60 + parseInt(b.start.split(':')[1]);
                        return aMin - bMin;
                      });
                      return { ...day, schedule: newSchedule };
                    }
                    return day;
                  });
                }
              }
            }
          }
          break;
        }
      }
    }
    this.cdr.detectChanges();
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
