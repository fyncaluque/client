import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { ScheduleTimelineComponent } from '../schedule-timeline/schedule-timeline.component';
import { SuggestionsPanel } from '../suggestions-panel/suggestions-panel.component';

@Component({
  selector: 'app-schedule-view',
  standalone: true,
  imports: [CommonModule, RouterLink, ScheduleTimelineComponent, SuggestionsPanel],
  template: `
    <div class="max-w-7xl mx-auto px-4 py-8">
      <div class="flex items-center gap-4 mb-8">
        <a routerLink="/dashboard" class="text-gray-400 hover:text-gray-600">
          &larr; Volver
        </a>
        @if (schedule) {
          <div>
            <h1 class="text-2xl font-bold">
              {{ schedule.dayOfWeek | titlecase }}
            </h1>
            <p class="text-gray-500 text-sm">{{ schedule.date | date:'fullDate' }}</p>
          </div>
        }
      </div>

      @if (loading) {
        <div class="card text-center py-12">
          <div class="animate-spin w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full mx-auto mb-4"></div>
          <p class="text-gray-500">Cargando horario...</p>
        </div>
      }

      @if (schedule && !loading) {
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div class="lg:col-span-2">
            <app-schedule-timeline [blocks]="schedule.schedule" />
          </div>
          <div>
            <app-suggestions-panel
              [suggestions]="schedule.suggestions"
              [tips]="schedule.tips"
            />
          </div>
        </div>
      }

      @if (!schedule && !loading) {
        <div class="card text-center py-12">
          <p class="text-gray-500">Horario no encontrado</p>
          <a routerLink="/dashboard" class="btn-primary mt-4 inline-block">Volver al dashboard</a>
        </div>
      }
    </div>
  `,
})
export class ScheduleViewComponent implements OnInit {
  schedule: any = null;
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private api: ApiService,
    private router: Router
  ) {}

  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.router.navigate(['/dashboard']);
      return;
    }

    try {
      const response: any = await this.api.getSchedule(id);
      if (response?.success) {
        this.schedule = response.data;
      }
    } catch {
      // Schedule not found
    } finally {
      this.loading = false;
    }
  }
}
