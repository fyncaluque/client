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
      <div class="card mb-4">
        <h3 class="text-lg font-bold mb-3">Consejos para ti</h3>
        <div class="space-y-2">
          @for (tip of tips; track $index) {
            <div class="flex gap-2 text-sm">
              <span class="text-indigo-500 flex-shrink-0 mt-0.5">*</span>
              <span class="text-gray-600">{{ tip }}</span>
            </div>
          }
        </div>
      </div>
    }

    <!-- Suggestions -->
    <div class="card">
      <h3 class="text-lg font-bold mb-3">Actividades sugeridas</h3>
      <p class="text-sm text-gray-500 mb-4">
        Actividades que podrías agregar a tu rutina basadas en tus objetivos.
      </p>

      <div class="space-y-3">
        @for (suggestion of suggestions; track $index) {
          <div class="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
            <div class="flex justify-between items-start">
              <span class="text-sm font-medium text-gray-900">{{ suggestion.activity }}</span>
              <span class="text-xs text-gray-400 flex-shrink-0 ml-2">{{ suggestion.duration }}min</span>
            </div>
            <p class="text-xs text-gray-500 mt-1">{{ suggestion.reason }}</p>
            <div class="flex gap-2 mt-2">
              <span class="text-xs bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full">
                {{ getTimeLabel(suggestion.bestTimeOfDay) }}
              </span>
              <span class="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">
                {{ getEnergyLabel(suggestion.energyRequired) }}
              </span>
            </div>
          </div>
        }
      </div>

      @if (!suggestions || suggestions.length === 0) {
        <div class="text-center py-6 text-gray-400 text-sm">
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
