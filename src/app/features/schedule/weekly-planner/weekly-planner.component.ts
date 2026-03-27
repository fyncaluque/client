import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, Input, Output } from '@angular/core';
import type { AppTheme } from '../../../core/services/theme.service';
import {
  CATEGORY_BORDER_DARK,
  CATEGORY_BORDER_LIGHT,
  CATEGORY_FILL,
  WEEKLY_PLANNER_SKIN,
} from './weekly-planner.theme';

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
    <div [class]="skin.shell">
      <div [class]="skin.header">
        <div>
          <h2 [class]="skin.headerTitle">Agenda semanal</h2>
          <p [class]="skin.headerSub">Arrastra y suelta para mover actividades en el tiempo</p>
        </div>
        <span [class]="skin.headerSub">{{ getTotalBlocks() }} bloques</span>
      </div>

      <div class="overflow-auto h-[calc(100%-57px)]">
        <div class="min-w-[1020px]">
          <div [class]="skin.sticky" [style.gridTemplateColumns]="gridTemplateColumns">
            <div [class]="skin.colHora">Hora</div>
            @for (day of weekDays; track day.id) {
              <button
                type="button"
                [class]="dayHeaderClass(day)"
                (click)="selectedDayChange.emit(day.dayOfWeek)"
              >
                <div [class]="skin.dayLabel">{{ getDayLabel(day.dayOfWeek) }}</div>
                <div [class]="skin.dayDate">{{ day.date | date:'d MMM' }}</div>
              </button>
            }
          </div>

          <div class="grid relative" [style.gridTemplateColumns]="gridTemplateColumns">
            <div [class]="skin.gridTimeCol" [style.height.px]="dayHeightPx">
              @for (hour of hours; track hour) {
                <div [class]="skin.hourLine" [style.top.px]="hour * hourHeightPx">
                  <span [class]="skin.hourLabel">{{ formatHour(hour) }}</span>
                </div>
              }
            </div>

            @for (day of weekDays; track day.id; let dayIndex = $index) {
              <div
                [class]="skin.dayCol"
                [style.height.px]="dayHeightPx"
                #dayColumn
                (dragover)="onDayDragOver($event)"
                (dragleave)="onDayDragLeave($event)"
                (drop)="onDayDrop($event, dayIndex, dayColumn)"
              >
                @for (hour of hours; track hour) {
                  <div
                    [class]="skin.hourLineInner"
                    [style.top.px]="hour * hourHeightPx"
                  ></div>
                }

                @for (block of day.schedule; track $index; let blockIndex = $index) {
                  <div
                    class="absolute left-1 right-1 rounded-lg border cursor-move p-2 overflow-hidden"
                    draggable="true"
                    [style.top.px]="timeToPx(block.start)"
                    [style.height.px]="getBlockHeight(block)"
                    [style.backgroundColor]="getCategoryFill(block.category)"
                    [style.borderColor]="getCategoryBorder(block.category)"
                    (dragstart)="onBlockDragStart($event, dayIndex, blockIndex)"
                  >
                    <div class="flex items-start justify-between gap-2">
                      <div class="min-w-0">
                        <p [class]="skin.blockTitle">{{ block.activity }}</p>
                        <p [class]="skin.blockMeta">{{ block.start }} - {{ block.end }}</p>
                      </div>
                      <div class="flex items-center gap-1">
                        @if (!block.isFixed) {
                          <button
                            type="button"
                            [class]="skin.regenBtn"
                            (click)="requestRegeneration($event, day.id, block)"
                            title="Regenerar bloque"
                          >
                            ↻
                          </button>
                        }
                        @if (block.isFixed) {
                          <span [class]="skin.fixedTag">Fijo</span>
                        }
                      </div>
                    </div>
                  </div>
                }
              </div>
            }

            @if (dropPreview) {
              <div [class]="skin.dropLine" [style.top.px]="minutesToPx(dropPreview.startMinutes)">
                <span [class]="skin.dropBadge">{{ formatTime(dropPreview.startMinutes) }}</span>
              </div>
            }
          </div>
        </div>
      </div>
    </div>
  `,
})
export class WeeklyPlannerComponent {
  @Input() theme: AppTheme = 'light';
  @Input() weekDays: WeekDaySchedule[] = [];
  @Input() selectedDay = 'monday';
  @Output() selectedDayChange = new EventEmitter<string>();
  @Output() weekDaysChange = new EventEmitter<WeekDaySchedule[]>();
  @Output() regenerateRange = new EventEmitter<{ dayId: string; range: { start: string; end: string } }>();

  readonly hourHeightPx = 56;
  readonly hours = Array.from({ length: 25 }, (_, i) => i);
  private dragState: { dayIndex: number; blockIndex: number; durationMinutes: number } | null = null;
  dropPreview: { startMinutes: number } | null = null;

  get skin() {
    return WEEKLY_PLANNER_SKIN[this.theme];
  }

  dayHeaderClass(day: WeekDaySchedule): string {
    const s = this.skin;
    const active = day.dayOfWeek === this.selectedDay ? ` ${s.dayBtnActive}` : '';
    return `${s.dayBtn} ${s.dayBtnHover}${active}`;
  }

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

  getCategoryFill(category: string): string {
    return CATEGORY_FILL[category] ?? '#d8d4f2';
  }

  getCategoryBorder(category: string): string {
    const map = this.theme === 'dark' ? CATEGORY_BORDER_DARK : CATEGORY_BORDER_LIGHT;
    return map[category] ?? (this.theme === 'dark' ? '#6b6088' : '#c4bdd8');
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
