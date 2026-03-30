import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import type { AppTheme } from '../../../core/services/theme.service';
import { ThemeToggleComponent } from '../../../shared/components/theme-toggle/theme-toggle.component';
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
  planId?: string;
  planProgress?: { label: string; milestone?: string };
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
  imports: [CommonModule, FormsModule, ThemeToggleComponent],
  template: `
    <div [class]="skin.shell">
      <div [class]="skin.header">
        <div>
          <h2 [class]="skin.headerTitle">Agenda semanal</h2>
          <p [class]="skin.headerSub">Arrastra y suelta para mover actividades en el tiempo</p>
        </div>
        <div class="flex items-center gap-3">
          <span [class]="skin.headerSub">{{ getTotalBlocks() }} bloques</span>

          <!-- Profile button -->
          <div class="relative">
            <button
              type="button"
              (click)="showProfile = !showProfile"
              class="p-1.5 rounded-lg transition-colors cursor-pointer"
              [class]="theme === 'light'
                ? 'text-[#6b628e] hover:bg-[#ece7ff]'
                : 'text-[#9b8fc4] hover:bg-[#3d3558]'"
              title="Ver perfil"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </button>

            @if (showProfile && profile) {
              <div
                class="absolute right-0 top-full mt-2 w-72 rounded-xl shadow-2xl border z-50 overflow-hidden"
                [class]="theme === 'light'
                  ? 'bg-[#f8f6ff] border-[#d8d4f2]'
                  : 'bg-[#2a2438] border-[#4a3f6b]'"
              >
                <!-- Profile header -->
                <div
                  class="px-4 py-3 border-b"
                  [class]="theme === 'light'
                    ? 'border-[#d8d4f2] bg-[#f3efff]'
                    : 'border-[#4a3f6b] bg-[#322b4a]'"
                >
                  <p class="text-sm font-semibold" [class]="theme === 'light' ? 'text-[#2f2a44]' : 'text-[#f0ecff]'">
                    {{ profile.name || 'Mi Perfil' }}
                  </p>
                  <p class="text-xs" [class]="theme === 'light' ? 'text-[#6b628e]' : 'text-[#9b8fc4]'">
                    {{ profile.email }}
                  </p>
                </div>

                <!-- Profile details -->
                <div class="p-3 space-y-3">
                  <!-- Horario -->
                  <div>
                    <p class="text-[10px] uppercase tracking-wide font-semibold mb-1.5" [class]="theme === 'light' ? 'text-[#6b628e]' : 'text-[#9b8fc4]'">Horario</p>
                    <div class="flex items-center gap-4 text-xs" [class]="theme === 'light' ? 'text-[#2f2a44]' : 'text-[#e8e4f5]'">
                      <span class="flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/></svg>
                        {{ profile.wakeUpTime || '--:--' }}
                      </span>
                      <span class="opacity-40">→</span>
                      <span class="flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
                        {{ profile.bedTime || '--:--' }}
                      </span>
                    </div>
                  </div>

                  <!-- Trabajo -->
                  @if (profile.workStart && profile.workEnd) {
                    <div>
                      <p class="text-[10px] uppercase tracking-wide font-semibold mb-1.5" [class]="theme === 'light' ? 'text-[#6b628e]' : 'text-[#9b8fc4]'">Trabajo</p>
                      <p class="text-xs" [class]="theme === 'light' ? 'text-[#2f2a44]' : 'text-[#e8e4f5]'">
                        {{ profile.workStart }} - {{ profile.workEnd }}
                        @if (profile.workDays?.length) {
                          <span class="opacity-60"> · {{ profile.workDays.length }} días</span>
                        }
                      </p>
                    </div>
                  }

                  <!-- Energía pico -->
                  <div>
                    <p class="text-[10px] uppercase tracking-wide font-semibold mb-1.5" [class]="theme === 'light' ? 'text-[#6b628e]' : 'text-[#9b8fc4]'">Energía pico</p>
                    <p class="text-xs" [class]="theme === 'light' ? 'text-[#2f2a44]' : 'text-[#e8e4f5]'">
                      {{ profile.peakEnergyStart || '--:--' }} - {{ profile.peakEnergyEnd || '--:--' }}
                    </p>
                  </div>

                  <!-- Estilo de vida -->
                  <div class="flex gap-4">
                    <div>
                      <p class="text-[10px] uppercase tracking-wide font-semibold mb-1" [class]="theme === 'light' ? 'text-[#6b628e]' : 'text-[#9b8fc4]'">Estilo</p>
                      <p class="text-xs capitalize" [class]="theme === 'light' ? 'text-[#2f2a44]' : 'text-[#e8e4f5]'">
                        {{ profile.lifestyle || '—' }}
                      </p>
                    </div>
                    @if (profile.workType) {
                      <div>
                        <p class="text-[10px] uppercase tracking-wide font-semibold mb-1" [class]="theme === 'light' ? 'text-[#6b628e]' : 'text-[#9b8fc4]'">Tipo</p>
                        <p class="text-xs capitalize" [class]="theme === 'light' ? 'text-[#2f2a44]' : 'text-[#e8e4f5]'">
                          {{ profile.workType }}
                        </p>
                      </div>
                    }
                  </div>

                  <!-- Objetivos -->
                  @if (profile.goals?.length) {
                    <div>
                      <p class="text-[10px] uppercase tracking-wide font-semibold mb-1.5" [class]="theme === 'light' ? 'text-[#6b628e]' : 'text-[#9b8fc4]'">Objetivos</p>
                      <div class="flex flex-wrap gap-1">
                        @for (goal of profile.goals; track goal) {
                          <span
                            class="text-[10px] px-2 py-0.5 rounded-full"
                            [class]="theme === 'light'
                              ? 'bg-[#ece7ff] text-[#6b628e]'
                              : 'bg-[#3d3558] text-[#9b8fc4]'"
                          >{{ goal }}</span>
                        }
                      </div>
                    </div>
                  }

                  <!-- Actions -->
                  <div
                    class="border-t pt-2.5 mt-2.5 flex gap-2"
                    [class]="theme === 'light' ? 'border-[#e8e2ff]' : 'border-[#3d3558]'"
                  >
                    <button
                      type="button"
                      (click)="openEditProfile()"
                      class="flex-1 text-xs py-1.5 rounded-lg transition-colors cursor-pointer font-medium"
                      [class]="theme === 'light'
                        ? 'bg-[#ece7ff] text-[#6b628e] hover:bg-[#e3dcff]'
                        : 'bg-[#3d3558] text-[#9b8fc4] hover:bg-[#4a3f6b]'"
                    >
                      Editar perfil
                    </button>
                    <button
                      type="button"
                      (click)="showDeleteConfirm = true; showProfile = false"
                      class="flex-1 text-xs py-1.5 rounded-lg transition-colors cursor-pointer font-medium"
                      [class]="theme === 'light'
                        ? 'bg-[#ffe4ec] text-[#a14f68] hover:bg-[#ffd6e0]'
                        : 'bg-[#3d2830] text-[#f0a0b8] hover:bg-[#4d3040]'"
                    >
                      Eliminar horario
                    </button>
                  </div>
                </div>
              </div>
            }
          </div>

          <button
            type="button"
            (click)="refreshSchedule.emit()"
            class="p-1.5 rounded-lg transition-colors cursor-pointer"
            [class]="theme === 'light'
              ? 'text-[#6b628e] hover:bg-[#ece7ff]'
              : 'text-[#9b8fc4] hover:bg-[#3d3558]'"
            title="Recargar horario"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="23 4 23 10 17 10"/>
              <polyline points="1 20 1 14 7 14"/>
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
            </svg>
          </button>
          <app-theme-toggle
            [theme]="theme"
            (themeChange)="themeToggle.emit()"
          />
        </div>
      </div>

      <div [class]="'overflow-auto h-[calc(100%-57px)] ' + (theme === 'light' ? 'scrollbar-theme-light' : 'scrollbar-theme-dark')">
        <div class="min-w-[1020px]">
          <div [class]="skin.sticky" [style.gridTemplateColumns]="gridTemplateColumns">
            <div [class]="skin.colHora">Hora</div>
            @for (day of displayDays; track day.id) {
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
                <div [class]="skin.hourLine" [style.top.px]="hourToPx(hour)">
                  <span [class]="skin.hourLabel">{{ formatHour(hour) }}</span>
                </div>
              }
            </div>

            @for (day of displayDays; track day.id; let dayIndex = $index) {
              <div
                [class]="skin.dayCol"
                [style.height.px]="dayHeightPx"
                #dayColumn
                (dragover)="onDayDragOver($event, dayIndex)"
                (dragleave)="onDayDragLeave($event)"
                (drop)="onDayDrop($event, dayIndex, dayColumn)"
              >
                @for (hour of hours; track hour) {
                  <div
                    [class]="skin.hourLineInner"
                    [style.top.px]="hourToPx(hour)"
                  ></div>
                }

                @for (block of day.schedule; track $index; let blockIndex = $index) {
                  <div
                    class="absolute left-1 right-1 rounded-lg border cursor-move p-2 overflow-hidden"
                    [class.border-dashed]="block.planId"
                    draggable="true"
                    [style.top.px]="timeToPx(block.start)"
                    [style.height.px]="getBlockHeight(block)"
                    [style.backgroundColor]="getCategoryFill(block.category)"
                    [style.borderColor]="getCategoryBorder(block.category)"
                    [style.opacity]="block.planId ? '0.85' : '1'"
                    (dragstart)="onBlockDragStart($event, dayIndex, blockIndex)"
                  >
                    <div class="flex items-start justify-between gap-2">
                      <div class="min-w-0">
                        <p [class]="skin.blockTitle">{{ block.activity }}</p>
                        <p [class]="skin.blockMeta">{{ block.start }} - {{ block.end }}</p>
                        @if (block.planProgress) {
                          <div class="flex items-center gap-1 mt-1">
                            <span
                              class="text-[9px] px-1.5 py-0.5 rounded-full font-medium"
                              [class]="theme === 'light'
                                ? 'bg-[#8dd3c7]/30 text-[#2a7a6a]'
                                : 'bg-[#6db8a8]/30 text-[#a8e2d8]'"
                            >{{ block.planProgress.label }}</span>
                            @if (block.planProgress.milestone) {
                              <span
                                class="text-[9px] truncate opacity-70"
                                [class]="theme === 'light' ? 'text-[#6b628e]' : 'text-[#9b8fc4]'"
                              >{{ block.planProgress.milestone }}</span>
                            }
                          </div>
                        }
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

      <!-- Edit Profile Modal -->
      @if (showEditProfile) {
        <div class="absolute inset-0 z-50 flex items-center justify-center bg-black/40 rounded-2xl">
          <div
            class="w-[420px] max-h-[80vh] rounded-xl shadow-2xl overflow-hidden flex flex-col"
            [class]="theme === 'light'
              ? 'bg-[#f8f6ff] border border-[#d8d4f2]'
              : 'bg-[#2a2438] border border-[#4a3f6b]'"
          >
            <!-- Modal header -->
            <div
              class="flex items-center justify-between px-4 py-3 border-b shrink-0"
              [class]="theme === 'light'
                ? 'border-[#d8d4f2] bg-[#f3efff]'
                : 'border-[#4a3f6b] bg-[#322b4a]'"
            >
              <h3 class="text-sm font-semibold" [class]="theme === 'light' ? 'text-[#2f2a44]' : 'text-[#f0ecff]'">Editar perfil</h3>
              <button type="button" (click)="showEditProfile = false" class="p-1 rounded-lg cursor-pointer" [class]="theme === 'light' ? 'text-[#6b628e] hover:bg-[#ece7ff]' : 'text-[#9b8fc4] hover:bg-[#3d3558]'">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            <!-- Modal body -->
            <div class="overflow-y-auto p-4 space-y-4" [class]="theme === 'light' ? 'scrollbar-theme-light' : 'scrollbar-theme-dark'">
              <!-- Nombre -->
              <div>
                <label class="block text-[10px] uppercase tracking-wide font-semibold mb-1" [class]="theme === 'light' ? 'text-[#6b628e]' : 'text-[#9b8fc4]'">Nombre</label>
                <input type="text" [(ngModel)]="editForm.name" class="w-full rounded-lg px-3 py-2 text-sm outline-none" [class]="theme === 'light' ? 'bg-white border border-[#d8d4f2] text-[#2f2a44] focus:border-[#8dd3c7]' : 'bg-[#1d1a2e] border border-[#4a3f6b] text-[#e8e4f5] focus:border-[#6db8a8]'" />
              </div>

              <!-- Horario de sueño -->
              <div>
                <label class="block text-[10px] uppercase tracking-wide font-semibold mb-1.5" [class]="theme === 'light' ? 'text-[#6b628e]' : 'text-[#9b8fc4]'">Horario de sueño</label>
                <div class="flex gap-3">
                  <div class="flex-1">
                    <label class="block text-[10px] mb-1" [class]="theme === 'light' ? 'text-[#a89fd0]' : 'text-[#6b6088]'">Despertar</label>
                    <input type="time" [(ngModel)]="editForm.wakeUpTime" class="w-full rounded-lg px-3 py-2 text-sm outline-none" [class]="theme === 'light' ? 'bg-white border border-[#d8d4f2] text-[#2f2a44] focus:border-[#8dd3c7]' : 'bg-[#1d1a2e] border border-[#4a3f6b] text-[#e8e4f5] focus:border-[#6db8a8]'" />
                  </div>
                  <div class="flex-1">
                    <label class="block text-[10px] mb-1" [class]="theme === 'light' ? 'text-[#a89fd0]' : 'text-[#6b6088]'">Dormir</label>
                    <input type="time" [(ngModel)]="editForm.bedTime" class="w-full rounded-lg px-3 py-2 text-sm outline-none" [class]="theme === 'light' ? 'bg-white border border-[#d8d4f2] text-[#2f2a44] focus:border-[#8dd3c7]' : 'bg-[#1d1a2e] border border-[#4a3f6b] text-[#e8e4f5] focus:border-[#6db8a8]'" />
                  </div>
                </div>
              </div>

              <!-- Horario de trabajo -->
              <div>
                <label class="block text-[10px] uppercase tracking-wide font-semibold mb-1.5" [class]="theme === 'light' ? 'text-[#6b628e]' : 'text-[#9b8fc4]'">Horario de trabajo</label>
                <div class="flex gap-3">
                  <div class="flex-1">
                    <label class="block text-[10px] mb-1" [class]="theme === 'light' ? 'text-[#a89fd0]' : 'text-[#6b6088]'">Inicio</label>
                    <input type="time" [(ngModel)]="editForm.workStart" class="w-full rounded-lg px-3 py-2 text-sm outline-none" [class]="theme === 'light' ? 'bg-white border border-[#d8d4f2] text-[#2f2a44] focus:border-[#8dd3c7]' : 'bg-[#1d1a2e] border border-[#4a3f6b] text-[#e8e4f5] focus:border-[#6db8a8]'" />
                  </div>
                  <div class="flex-1">
                    <label class="block text-[10px] mb-1" [class]="theme === 'light' ? 'text-[#a89fd0]' : 'text-[#6b6088]'">Fin</label>
                    <input type="time" [(ngModel)]="editForm.workEnd" class="w-full rounded-lg px-3 py-2 text-sm outline-none" [class]="theme === 'light' ? 'bg-white border border-[#d8d4f2] text-[#2f2a44] focus:border-[#8dd3c7]' : 'bg-[#1d1a2e] border border-[#4a3f6b] text-[#e8e4f5] focus:border-[#6db8a8]'" />
                  </div>
                </div>
              </div>

              <!-- Energía pico -->
              <div>
                <label class="block text-[10px] uppercase tracking-wide font-semibold mb-1.5" [class]="theme === 'light' ? 'text-[#6b628e]' : 'text-[#9b8fc4]'">Energía pico</label>
                <div class="flex gap-3">
                  <div class="flex-1">
                    <label class="block text-[10px] mb-1" [class]="theme === 'light' ? 'text-[#a89fd0]' : 'text-[#6b6088]'">Inicio</label>
                    <input type="time" [(ngModel)]="editForm.peakEnergyStart" class="w-full rounded-lg px-3 py-2 text-sm outline-none" [class]="theme === 'light' ? 'bg-white border border-[#d8d4f2] text-[#2f2a44] focus:border-[#8dd3c7]' : 'bg-[#1d1a2e] border border-[#4a3f6b] text-[#e8e4f5] focus:border-[#6db8a8]'" />
                  </div>
                  <div class="flex-1">
                    <label class="block text-[10px] mb-1" [class]="theme === 'light' ? 'text-[#a89fd0]' : 'text-[#6b6088]'">Fin</label>
                    <input type="time" [(ngModel)]="editForm.peakEnergyEnd" class="w-full rounded-lg px-3 py-2 text-sm outline-none" [class]="theme === 'light' ? 'bg-white border border-[#d8d4f2] text-[#2f2a44] focus:border-[#8dd3c7]' : 'bg-[#1d1a2e] border border-[#4a3f6b] text-[#e8e4f5] focus:border-[#6db8a8]'" />
                  </div>
                </div>
              </div>

              <!-- Estilo de vida -->
              <div>
                <label class="block text-[10px] uppercase tracking-wide font-semibold mb-1" [class]="theme === 'light' ? 'text-[#6b628e]' : 'text-[#9b8fc4]'">Estilo de vida</label>
                <select [(ngModel)]="editForm.lifestyle" class="w-full rounded-lg px-3 py-2 text-sm outline-none" [class]="theme === 'light' ? 'bg-white border border-[#d8d4f2] text-[#2f2a44]' : 'bg-[#1d1a2e] border border-[#4a3f6b] text-[#e8e4f5]'">
                  <option value="active">Activo</option>
                  <option value="balanced">Equilibrado</option>
                  <option value="sedentary">Sedentario</option>
                </select>
              </div>

              <!-- Tipo de trabajo -->
              <div>
                <label class="block text-[10px] uppercase tracking-wide font-semibold mb-1" [class]="theme === 'light' ? 'text-[#6b628e]' : 'text-[#9b8fc4]'">Tipo de trabajo</label>
                <select [(ngModel)]="editForm.workType" class="w-full rounded-lg px-3 py-2 text-sm outline-none" [class]="theme === 'light' ? 'bg-white border border-[#d8d4f2] text-[#2f2a44]' : 'bg-[#1d1a2e] border border-[#4a3f6b] text-[#e8e4f5]'">
                  <option value="remote">Remoto</option>
                  <option value="office">Oficina</option>
                  <option value="hybrid">Híbrido</option>
                  <option value="student">Estudiante</option>
                  <option value="freelance">Freelance</option>
                </select>
              </div>
            </div>

            <!-- Modal footer -->
            <div
              class="flex justify-end gap-2 px-4 py-3 border-t shrink-0"
              [class]="theme === 'light'
                ? 'border-[#d8d4f2] bg-[#f3efff]'
                : 'border-[#4a3f6b] bg-[#322b4a]'"
            >
              <button
                type="button"
                (click)="showEditProfile = false"
                class="px-4 py-1.5 rounded-lg text-xs font-medium cursor-pointer"
                [class]="theme === 'light'
                  ? 'text-[#6b628e] hover:bg-[#ece7ff]'
                  : 'text-[#9b8fc4] hover:bg-[#3d3558]'"
              >Cancelar</button>
              <button
                type="button"
                (click)="saveProfile()"
                class="px-4 py-1.5 rounded-lg text-xs font-medium cursor-pointer"
                [class]="theme === 'light'
                  ? 'bg-[#8dd3c7] text-[#1f2937] hover:bg-[#a8e2d8]'
                  : 'bg-[#6db8a8] text-[#0f1a18] hover:bg-[#8dd3c7]'"
              >Guardar</button>
            </div>
          </div>
        </div>
      }

      <!-- Delete Confirmation Dialog -->
      @if (showDeleteConfirm) {
        <div class="absolute inset-0 z-50 flex items-center justify-center bg-black/40 rounded-2xl">
          <div
            class="w-[340px] rounded-xl shadow-2xl overflow-hidden"
            [class]="theme === 'light'
              ? 'bg-[#f8f6ff] border border-[#d8d4f2]'
              : 'bg-[#2a2438] border border-[#4a3f6b]'"
          >
            <div class="p-5 text-center">
              <div
                class="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center"
                [class]="theme === 'light'
                  ? 'bg-[#ffe4ec]'
                  : 'bg-[#3d2830]'"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" [class]="theme === 'light' ? 'text-[#a14f68]' : 'text-[#f0a0b8]'">
                  <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                </svg>
              </div>
              <h3 class="text-sm font-semibold mb-1" [class]="theme === 'light' ? 'text-[#2f2a44]' : 'text-[#f0ecff]'">Eliminar horario</h3>
              <p class="text-xs mb-4" [class]="theme === 'light' ? 'text-[#6b628e]' : 'text-[#9b8fc4]'">
                Se eliminará todo el horario semanal actual. Esta acción no se puede deshacer.
              </p>
              <div class="flex gap-2">
                <button
                  type="button"
                  (click)="showDeleteConfirm = false"
                  class="flex-1 px-4 py-2 rounded-lg text-xs font-medium cursor-pointer"
                  [class]="theme === 'light'
                    ? 'text-[#6b628e] bg-[#ece7ff] hover:bg-[#e3dcff]'
                    : 'text-[#9b8fc4] bg-[#3d3558] hover:bg-[#4a3f6b]'"
                >Cancelar</button>
                <button
                  type="button"
                  (click)="confirmDeleteSchedule()"
                  class="flex-1 px-4 py-2 rounded-lg text-xs font-medium cursor-pointer"
                  [class]="theme === 'light'
                    ? 'bg-[#f2b8c6] text-[#7f1d3f] hover:bg-[#e8a8b8]'
                    : 'bg-[#8b4a5c] text-[#fce4ec] hover:bg-[#9b5a6c]'"
                >Eliminar</button>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class WeeklyPlannerComponent {
  @Input() theme: AppTheme = 'light';
  @Input() weekDays: WeekDaySchedule[] = [];
  @Input() selectedDay = 'monday';
  @Input() profile: any = null;
  @Output() selectedDayChange = new EventEmitter<string>();
  @Output() weekDaysChange = new EventEmitter<WeekDaySchedule[]>();
  @Output() themeToggle = new EventEmitter<void>();
  @Output() refreshSchedule = new EventEmitter<void>();
  @Output() regenerateRange = new EventEmitter<{ dayId: string; range: { start: string; end: string } }>();
  @Output() editProfile = new EventEmitter<any>();
  @Output() deleteSchedule = new EventEmitter<void>();

  readonly hourHeightPx = 56;
  readonly dayNames = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;
  showProfile = false;
  showEditProfile = false;
  showDeleteConfirm = false;
  editForm: any = {};
  private dragState: { dayIndex: number; blockIndex: number; durationMinutes: number } | null = null;
  private dragOverDayIndex: number = -1;
  dropPreview: { startMinutes: number } | null = null;

  get hours(): number[] {
    const start = this.timeToMinutes(this.profile?.wakeUpTime || '06:00');
    const end = this.timeToMinutes(this.profile?.bedTime || '23:00');
    const startHour = Math.floor(start / 60);
    const endHour = Math.min(Math.ceil(end / 60), 24);
    return Array.from({ length: endHour - startHour + 1 }, (_, i) => startHour + i);
  }

  get displayDays(): WeekDaySchedule[] {
    const dataMap = new Map<string, WeekDaySchedule>();
    for (const d of this.weekDays) {
      dataMap.set(d.dayOfWeek, d);
    }
    return this.dayNames.map((dayName, i) => {
      const existing = dataMap.get(dayName);
      if (existing) return existing;
      const monday = this.getMonday();
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      return {
        id: `empty-${dayName}`,
        date: date.toISOString(),
        dayOfWeek: dayName,
        schedule: [],
        suggestions: [],
        tips: [],
      };
    });
  }

  private getMonday(): Date {
    const ref = this.weekDays.length > 0 ? new Date(this.weekDays[0].date) : new Date();
    ref.setHours(0, 0, 0, 0);
    const day = ref.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    ref.setDate(ref.getDate() + diff);
    return ref;
  }

  get skin() {
    return WEEKLY_PLANNER_SKIN[this.theme];
  }

  openEditProfile(): void {
    if (this.profile) {
      this.editForm = {
        name: this.profile.name || '',
        wakeUpTime: this.profile.wakeUpTime || '',
        bedTime: this.profile.bedTime || '',
        workStart: this.profile.workStart || '',
        workEnd: this.profile.workEnd || '',
        peakEnergyStart: this.profile.peakEnergyStart || '',
        peakEnergyEnd: this.profile.peakEnergyEnd || '',
        lifestyle: this.profile.lifestyle || 'balanced',
        workType: this.profile.workType || 'remote',
      };
    }
    this.showProfile = false;
    this.showEditProfile = true;
  }

  saveProfile(): void {
    this.editProfile.emit(this.editForm);
    this.showEditProfile = false;
  }

  confirmDeleteSchedule(): void {
    this.deleteSchedule.emit();
    this.showDeleteConfirm = false;
  }

  dayHeaderClass(day: WeekDaySchedule): string {
    const s = this.skin;
    const active = day.dayOfWeek === this.selectedDay ? ` ${s.dayBtnActive}` : '';
    return `${s.dayBtn} ${s.dayBtnHover}${active}`;
  }

  get gridTemplateColumns(): string {
    return '72px repeat(7, minmax(130px, 1fr))';
  }

  get dayHeightPx(): number {
    return this.hours.length * this.hourHeightPx;
  }

  hourToPx(hour: number): number {
    const startHour = this.hours.length > 0 ? this.hours[0] : 0;
    return (hour - startHour) * this.hourHeightPx;
  }

  getTotalBlocks(): number {
    return this.displayDays.reduce((acc, day) => acc + (day.schedule?.length || 0), 0);
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
    const totalMinutes = this.timeToMinutes(time);
    const startOffset = this.hours.length > 0 ? this.hours[0] * 60 : 0;
    return (totalMinutes - startOffset) * (this.hourHeightPx / 60);
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
    const day = this.displayDays[dayIndex];
    const block = day?.schedule?.[blockIndex];
    if (!block || block.isFixed) {
      event.preventDefault();
      return;
    }

    const durationMinutes = Math.max(this.timeToMinutes(block.end) - this.timeToMinutes(block.start), 15);
    this.dragState = { dayIndex, blockIndex, durationMinutes };
    this.dropPreview = { startMinutes: this.timeToMinutes(block.start) };
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', `${dayIndex}:${blockIndex}`);
    }
  }

  onDayDragOver(event: DragEvent, dayIndex: number): void {
    event.preventDefault();
    if (!this.dragState) return;

    this.dragOverDayIndex = dayIndex;
    const column = event.currentTarget as HTMLElement | null;
    if (column) {
      const rect = column.getBoundingClientRect();
      const offsetY = Math.max(0, Math.min(event.clientY - rect.top, this.dayHeightPx));
      const rawMinutes = this.pxToMinutes(offsetY);

      let startMinutes = this.snapToHourOrFiveMin(rawMinutes);

      const day = this.displayDays[dayIndex];
      if (day?.schedule?.length) {
        for (const block of day.schedule) {
          const topEdge = this.timeToMinutes(block.start);
          const bottomEdge = this.timeToMinutes(block.end);

          if (rawMinutes >= topEdge && rawMinutes <= bottomEdge) {
            startMinutes = Math.max(0, Math.min(topEdge, 24 * 60 - this.dragState.durationMinutes));
            break;
          }
        }
      }

      this.dropPreview = { startMinutes };
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
    this.dragOverDayIndex = -1;
  }

  onDayDrop(event: DragEvent, targetDayIndex: number, dayColumn: ElementRef | HTMLElement): void {
    event.preventDefault();
    if (!this.dragState) return;

    let startMinutes: number;

    if (this.dropPreview) {
      startMinutes = this.dropPreview.startMinutes;
    } else {
      const targetElement = dayColumn instanceof ElementRef ? dayColumn.nativeElement : dayColumn;
      const rect = targetElement.getBoundingClientRect();
      const offsetY = Math.max(0, Math.min(event.clientY - rect.top, this.dayHeightPx));
      const rawMinutes = this.snapToHourOrFiveMin(this.pxToMinutes(offsetY));
      startMinutes = Math.max(0, Math.min(rawMinutes, 24 * 60 - this.dragState.durationMinutes));
    }

    const endMinutes = startMinutes + this.dragState.durationMinutes;

    const nextWeek = this.displayDays.map((d) => ({ ...d, schedule: [...(d.schedule || [])] }));
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
    this.dragOverDayIndex = -1;
  }

  requestRegeneration(event: Event, dayId: string, block: ScheduleBlock): void {
    event.stopPropagation();
    this.regenerateRange.emit({
      dayId,
      range: { start: block.start, end: block.end },
    });
  }

  minutesToPx(minutes: number): number {
    const startOffset = this.hours.length > 0 ? this.hours[0] * 60 : 0;
    return (minutes - startOffset) * (this.hourHeightPx / 60);
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

  private snapToHourOrFiveMin(minutes: number): number {
    const hourMagnetThreshold = 5;
    const modulo = minutes % 60;
    if (modulo <= hourMagnetThreshold) {
      return Math.floor(minutes / 60) * 60;
    }
    if (modulo >= 60 - hourMagnetThreshold) {
      return Math.ceil(minutes / 60) * 60;
    }
    return Math.round(minutes / 5) * 5;
  }
}
