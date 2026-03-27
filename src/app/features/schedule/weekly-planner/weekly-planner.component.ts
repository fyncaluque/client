import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, Input, Output } from '@angular/core';

interface ScheduleBlock {
  start: string;
  end: string;
  activity: string;
  category: string;
  energy: string;
  isFixed: boolean;
  notes?: string;
}

interface WeekDaySchedule {
  id: string;
  date: string;
  dayOfWeek: string;
  schedule: ScheduleBlock[];
  suggestions?: any[];
  tips?: string[];
}

@Component({
  selector: 'app-weekly-planner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="rounded-2xl border border-slate-800 bg-slate-950 text-slate-100 shadow-2xl shadow-slate-950/30">
      <div class="border-b border-slate-800 px-4 py-3 flex items-center justify-between">
        <div>
          <h2 class="text-base font-semibold">Agenda semanal</h2>
          <p class="text-xs text-slate-400">Arrastra y suelta para mover actividades en el tiempo</p>
        </div>
        <span class="text-xs text-slate-400">{{ getTotalBlocks() }} bloques</span>
      </div>

      <div class="overflow-auto max-h-[70vh]">
        <div class="min-w-[980px]">
          <div class="grid sticky top-0 z-20 bg-slate-950/95 backdrop-blur border-b border-slate-800"
            [style.gridTemplateColumns]="gridTemplateColumns">
            <div class="p-2 text-[11px] uppercase tracking-wide text-slate-500 font-semibold border-r border-slate-800">
              Hora
            </div>
            @for (day of weekDays; track day.id) {
              <button
                class="p-2 text-left border-r border-slate-800 hover:bg-slate-900 transition-colors"
                [class.bg-slate-900]="day.dayOfWeek === selectedDay"
                (click)="selectedDayChange.emit(day.dayOfWeek)"
              >
                <div class="text-xs uppercase tracking-wide text-slate-400">{{ getDayLabel(day.dayOfWeek) }}</div>
                <div class="text-sm font-medium text-slate-100">{{ day.date | date:'d MMM' }}</div>
              </button>
            }
          </div>

          <div class="grid relative" [style.gridTemplateColumns]="gridTemplateColumns">
            <div class="border-r border-slate-800 relative" [style.height.px]="dayHeightPx">
              @for (hour of hours; track hour) {
                <div
                  class="absolute inset-x-0 border-t border-slate-800/80"
                  [style.top.px]="hour * hourHeightPx"
                >
                  <span class="absolute -top-2 left-2 text-[10px] text-slate-500 bg-slate-950 px-1">
                    {{ formatHour(hour) }}
                  </span>
                </div>
              }
            </div>

            @for (day of weekDays; track day.id; let dayIndex = $index) {
              <div
                class="relative border-r border-slate-800"
                [style.height.px]="dayHeightPx"
                #dayColumn
                (dragover)="onDayDragOver($event)"
                (dragleave)="onDayDragLeave($event)"
                (drop)="onDayDrop($event, dayIndex, dayColumn)"
              >
                @for (hour of hours; track hour) {
                  <div
                    class="absolute inset-x-0 border-t border-slate-800/70"
                    [style.top.px]="hour * hourHeightPx"
                  ></div>
                }

                @for (block of day.schedule; track $index; let blockIndex = $index) {
                  <div
                    class="absolute left-1 right-1 rounded-lg border cursor-move p-2 overflow-hidden"
                    draggable="true"
                    [style.top.px]="timeToPx(block.start)"
                    [style.height.px]="getBlockHeight(block)"
                    [style.backgroundColor]="getCategoryBg(block.category)"
                    [style.borderColor]="getCategoryColor(block.category)"
                    (dragstart)="onBlockDragStart($event, dayIndex, blockIndex)"
                  >
                    <div class="flex items-start justify-between gap-2">
                      <div class="min-w-0">
                        <p class="text-[11px] font-semibold truncate text-slate-50">
                          {{ block.activity }}
                        </p>
                        <p class="text-[10px] text-slate-300">
                          {{ block.start }} - {{ block.end }}
                        </p>
                      </div>
                      <div class="flex items-center gap-1">
                        @if (!block.isFixed) {
                          <button
                            class="text-[10px] text-cyan-300 hover:text-cyan-200"
                            (click)="requestRegeneration($event, day.id, block)"
                            title="Regenerar bloque"
                          >
                            ↻
                          </button>
                        }
                        @if (block.isFixed) {
                          <span class="text-[9px] text-amber-300">Fijo</span>
                        }
                      </div>
                    </div>
                  </div>
                }

              </div>
            }

            @if (dropPreview) {
              <div
                class="absolute left-0 right-0 border-t-2 border-cyan-400 pointer-events-none z-40"
                [style.top.px]="minutesToPx(dropPreview.startMinutes)"
              >
                <span class="absolute -top-3 left-1 text-[10px] px-1.5 py-0.5 rounded bg-cyan-500 text-slate-950 font-semibold">
                  {{ formatTime(dropPreview.startMinutes) }}
                </span>
              </div>
            }
          </div>
        </div>
      </div>
    </div>
  `,
})
export class WeeklyPlannerComponent {
  @Input() weekDays: WeekDaySchedule[] = [];
  @Input() selectedDay = 'monday';
  @Output() selectedDayChange = new EventEmitter<string>();
  @Output() weekDaysChange = new EventEmitter<WeekDaySchedule[]>();
  @Output() regenerateRange = new EventEmitter<{ dayId: string; range: { start: string; end: string } }>();

  readonly hourHeightPx = 56;
  readonly hours = Array.from({ length: 25 }, (_, i) => i);
  private dragState: { dayIndex: number; blockIndex: number; durationMinutes: number } | null = null;
  dropPreview: { startMinutes: number } | null = null;

  get gridTemplateColumns(): string {
    return `72px repeat(${Math.max(this.weekDays.length, 1)}, minmax(130px, 1fr))`;
  }

  get dayHeightPx(): number {
    return 24 * this.hourHeightPx;
  }

  getTotalBlocks(): number {
    return this.weekDays.reduce((acc, day) => acc + (day.schedule?.length || 0), 0);
  }

  getDayLabel(day: string): string {
    const map: Record<string, string> = {
      monday: 'Lunes',
      tuesday: 'Martes',
      wednesday: 'Miércoles',
      thursday: 'Jueves',
      friday: 'Viernes',
      saturday: 'Sábado',
      sunday: 'Domingo',
    };
    return map[day] || day;
  }

  formatHour(hour: number): string {
    return `${hour.toString().padStart(2, '0')}:00`;
  }

  timeToPx(time: string): number {
    return this.timeToMinutes(time) * (this.hourHeightPx / 60);
  }

  getBlockHeight(block: ScheduleBlock): number {
    const start = this.timeToMinutes(block.start);
    const end = this.timeToMinutes(block.end);
    const duration = Math.max(end - start, 30);
    return Math.max(duration * (this.hourHeightPx / 60), 24);
  }

  onBlockDragStart(event: DragEvent, dayIndex: number, blockIndex: number): void {
    const day = this.weekDays[dayIndex];
    const block = day?.schedule?.[blockIndex];
    if (!block || block.isFixed) {
      event.preventDefault();
      return;
    }

    const durationMinutes = Math.max(this.timeToMinutes(block.end) - this.timeToMinutes(block.start), 15);
    this.dragState = { dayIndex, blockIndex, durationMinutes };
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', `${dayIndex}:${blockIndex}`);
    }
  }

  onDayDragOver(event: DragEvent): void {
    event.preventDefault();
    if (!this.dragState) return;

    const column = event.currentTarget as HTMLElement | null;
    if (column) {
      const rect = column.getBoundingClientRect();
      const offsetY = Math.max(0, Math.min(event.clientY - rect.top, this.dayHeightPx));
      const rawMinutes = this.pxToMinutes(offsetY);
      const startMinutes = this.snapToQuarterHour(rawMinutes);
      this.dropPreview = {
        startMinutes: Math.max(0, Math.min(startMinutes, 24 * 60 - this.dragState.durationMinutes)),
      };
    }

    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
  }

  onDayDragLeave(event: DragEvent): void {
    const column = event.currentTarget as HTMLElement | null;
    const related = event.relatedTarget as Node | null;
    if (column && related && column.contains(related)) return;
    this.dropPreview = null;
  }

  onDayDrop(event: DragEvent, targetDayIndex: number, dayColumn: ElementRef | HTMLElement): void {
    event.preventDefault();
    if (!this.dragState) return;

    const targetElement = dayColumn instanceof ElementRef ? dayColumn.nativeElement : dayColumn;
    const rect = targetElement.getBoundingClientRect();
    const offsetY = Math.max(0, Math.min(event.clientY - rect.top, this.dayHeightPx));
    const rawMinutes = this.snapToQuarterHour(this.pxToMinutes(offsetY));
    const startMinutes = Math.max(0, Math.min(rawMinutes, 24 * 60 - this.dragState.durationMinutes));
    const endMinutes = startMinutes + this.dragState.durationMinutes;

    const nextWeek = this.weekDays.map((d) => ({ ...d, schedule: [...d.schedule] }));
    const sourceDay = nextWeek[this.dragState.dayIndex];
    const movedBlock = sourceDay.schedule[this.dragState.blockIndex];
    sourceDay.schedule.splice(this.dragState.blockIndex, 1);

    const updatedBlock: ScheduleBlock = {
      ...movedBlock,
      start: this.minutesToTime(startMinutes),
      end: this.minutesToTime(endMinutes),
    };

    const targetDay = nextWeek[targetDayIndex];
    targetDay.schedule.push(updatedBlock);
    targetDay.schedule.sort((a, b) => this.timeToMinutes(a.start) - this.timeToMinutes(b.start));

    this.weekDaysChange.emit(nextWeek);
    this.selectedDayChange.emit(targetDay.dayOfWeek);
    this.dropPreview = null;
    this.dragState = null;
  }

  requestRegeneration(event: Event, dayId: string, block: ScheduleBlock): void {
    event.stopPropagation();
    this.regenerateRange.emit({
      dayId,
      range: { start: block.start, end: block.end },
    });
  }

  getCategoryColor(category: string): string {
    const map: Record<string, string> = {
      sleep: '#6366f1',
      morning_routine: '#f59e0b',
      exercise: '#10b981',
      work: '#3b82f6',
      meal: '#f97316',
      deep_work: '#8b5cf6',
      learning: '#06b6d4',
      creative: '#ec4899',
      social: '#14b8a6',
      wellness: '#84cc16',
      leisure: '#a855f7',
      chores: '#78716c',
      commute: '#64748b',
      break: '#9ca3af',
      evening_routine: '#eab308',
      free_time: '#22c55e',
    };
    return map[category] || '#38bdf8';
  }

  getCategoryBg(category: string): string {
    return `${this.getCategoryColor(category)}33`;
  }

  minutesToPx(minutes: number): number {
    return minutes * (this.hourHeightPx / 60);
  }

  formatTime(totalMinutes: number): string {
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  }

  private pxToMinutes(px: number): number {
    return px / (this.hourHeightPx / 60);
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

  private snapToQuarterHour(minutes: number): number {
    return Math.round(minutes / 15) * 15;
  }

}
