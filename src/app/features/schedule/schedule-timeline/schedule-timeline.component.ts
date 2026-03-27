import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

interface ScheduleBlock {
  start: string;
  end: string;
  activity: string;
  category: string;
  energy: string;
  isFixed: boolean;
  notes?: string;
}

@Component({
  selector: 'app-schedule-timeline',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-lg font-bold">Horario del día</h2>
        <span class="text-sm text-gray-500">{{ blocks.length }} actividades</span>
      </div>

      <div class="space-y-1">
        @for (block of blocks; track $index) {
          <div
            class="flex gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
            [class]="getBlockClass(block)"
          >
            <!-- Time column -->
            <div class="flex-shrink-0 w-24 text-right">
              <span class="text-sm font-mono font-medium text-gray-700">
                {{ block.start }}
              </span>
              <span class="text-xs text-gray-400 block font-mono">
                {{ block.end }}
              </span>
            </div>

            <!-- Color bar -->
            <div
              class="w-1 rounded-full flex-shrink-0"
              [style.backgroundColor]="getCategoryColor(block.category)"
            ></div>

            <!-- Content -->
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2">
                <span class="text-sm font-medium text-gray-900">
                  {{ block.activity }}
                </span>
                @if (block.isFixed) {
                  <span class="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">Fijo</span>
                }
              </div>
              <div class="flex items-center gap-2 mt-0.5">
                <span class="text-xs px-2 py-0.5 rounded-full"
                  [style.backgroundColor]="getCategoryBgColor(block.category)"
                  [style.color]="getCategoryColor(block.category)"
                >
                  {{ getCategoryLabel(block.category) }}
                </span>
                <span class="text-xs text-gray-400">
                  {{ getEnergyLabel(block.energy) }}
                </span>
                <span class="text-xs text-gray-400">
                  {{ getDuration(block.start, block.end) }}
                </span>
              </div>
              @if (block.notes) {
                <p class="text-xs text-gray-500 mt-1">{{ block.notes }}</p>
              }
            </div>

            <!-- Regenerate button (appears on hover) -->
            @if (!block.isFixed) {
              <button
                class="opacity-0 group-hover:opacity-100 transition-opacity text-xs text-indigo-500 hover:text-indigo-700 flex-shrink-0"
                (click)="onRegenerate.emit({ start: block.start, end: block.end })"
              >
                Regenerar
              </button>
            }
          </div>
        }
      </div>

      @if (blocks.length === 0) {
        <div class="text-center py-8 text-gray-400">
          No hay bloques en el horario
        </div>
      }
    </div>
  `,
})
export class ScheduleTimelineComponent {
  @Input() blocks: ScheduleBlock[] = [];
  @Output() onRegenerate = new EventEmitter<{ start: string; end: string }>();

  categoryColors: Record<string, string> = {
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
    break: '#d1d5db',
    evening_routine: '#eab308',
    free_time: '#22c55e',
  };

  categoryLabels: Record<string, string> = {
    sleep: 'Sueño',
    morning_routine: 'Rutina matutina',
    exercise: 'Ejercicio',
    work: 'Trabajo',
    meal: 'Comida',
    deep_work: 'Trabajo profundo',
    learning: 'Aprendizaje',
    creative: 'Creatividad',
    social: 'Social',
    wellness: 'Bienestar',
    leisure: 'Ocio',
    chores: 'Tareas del hogar',
    commute: 'Transporte',
    break: 'Descanso',
    evening_routine: 'Rutina nocturna',
    free_time: 'Tiempo libre',
  };

  getCategoryColor(category: string): string {
    return this.categoryColors[category] || '#9ca3af';
  }

  getCategoryBgColor(category: string): string {
    return this.getCategoryColor(category) + '20';
  }

  getCategoryLabel(category: string): string {
    return this.categoryLabels[category] || category;
  }

  getEnergyLabel(energy: string): string {
    const map: Record<string, string> = {
      high: 'Alta energía',
      medium: 'Media energía',
      low: 'Baja energía',
    };
    return map[energy] || energy;
  }

  getDuration(start: string, end: string): string {
    const [sh, sm] = start.split(':').map(Number);
    const [eh, em] = end.split(':').map(Number);
    const totalMinutes = (eh * 60 + em) - (sh * 60 + sm);

    if (totalMinutes < 60) {
      return `${totalMinutes}min`;
    }
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
  }

  getBlockClass(block: ScheduleBlock): string {
    if (block.isFixed) {
      return 'bg-gray-50 border-l-2 border-gray-300';
    }
    return '';
  }
}
