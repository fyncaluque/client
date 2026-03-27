import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

interface ActivitySuggestion {
  activity: string;
  category: string;
  reason: string;
  duration: number;
  bestTimeOfDay: string;
  energyRequired: string;
}

@Component({
  selector: 'app-suggestions-panel',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Tips -->
    @if (tips && tips.length > 0) {
      <div class="rounded-2xl border border-slate-800 bg-slate-950 p-4 mb-4">
        <h3 class="text-lg font-bold mb-3 text-slate-100">Consejos para ti</h3>
        <div class="space-y-2">
          @for (tip of tips; track $index) {
            <div class="flex gap-2 text-sm">
              <span class="text-cyan-400 shrink-0 mt-0.5">*</span>
              <span class="text-slate-300">{{ tip }}</span>
            </div>
          }
        </div>
      </div>
    }

    <!-- Suggestions -->
    <div class="rounded-2xl border border-slate-800 bg-slate-950 p-4">
      <h3 class="text-lg font-bold mb-3 text-slate-100">Actividades sugeridas</h3>
      <p class="text-sm text-slate-400 mb-4">
        Actividades que podrías agregar a tu rutina basadas en tus objetivos.
      </p>

      <div class="space-y-3">
        @for (suggestion of suggestions; track $index) {
          <div class="p-3 bg-slate-900 border border-slate-800 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer">
            <div class="flex justify-between items-start">
              <span class="text-sm font-medium text-slate-100">{{ suggestion.activity }}</span>
              <span class="text-xs text-slate-500 shrink-0 ml-2">{{ suggestion.duration }}min</span>
            </div>
            <p class="text-xs text-slate-400 mt-1">{{ suggestion.reason }}</p>
            <div class="flex gap-2 mt-2">
              <span class="text-xs bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded-full">
                {{ getTimeLabel(suggestion.bestTimeOfDay) }}
              </span>
              <span class="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full">
                {{ getEnergyLabel(suggestion.energyRequired) }}
              </span>
            </div>
          </div>
        }
      </div>

      @if (!suggestions || suggestions.length === 0) {
        <div class="text-center py-6 text-slate-500 text-sm">
          Las sugerencias aparecerán cuando generes un horario
        </div>
      }
    </div>
  `,
})
export class SuggestionsPanel {
  @Input() suggestions: ActivitySuggestion[] = [];
  @Input() tips: string[] = [];

  getTimeLabel(timeOfDay: string): string {
    const map: Record<string, string> = {
      morning: 'Mañana',
      afternoon: 'Tarde',
      evening: 'Noche',
    };
    return map[timeOfDay] || timeOfDay;
  }

  getEnergyLabel(energy: string): string {
    const map: Record<string, string> = {
      high: 'Alta energía',
      medium: 'Media energía',
      low: 'Baja energía',
    };
    return map[energy] || energy;
  }
}
