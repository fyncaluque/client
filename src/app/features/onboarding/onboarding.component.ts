import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../core/services/api.service';

interface OnboardingData {
  name: string;
  wakeUpTime: string;
  bedTime: string;
  sleepHours: number;
  peakEnergyStart: string;
  peakEnergyEnd: string;
  lowEnergyStart: string;
  lowEnergyEnd: string;
  lifestyle: string;
  workType: string;
  workStart: string;
  workEnd: string;
  workDays: string[];
  goals: string[];
  interests: string[];
  exercisePreference: string;
  mealTimes: { breakfast: string; lunch: string; dinner: string };
  fixedCommitments: Array<{
    name: string;
    start: string;
    end: string;
    days: string[];
    category: string;
  }>;
}

@Component({
  selector: 'app-onboarding',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="max-w-2xl mx-auto px-4 py-8">
      <!-- Progress bar -->
      <div class="mb-8">
        <div class="flex justify-between text-sm text-gray-500 mb-2">
          <span>Paso {{ currentStep }} de {{ totalSteps }}</span>
          <span>{{ stepTitles[currentStep - 1] }}</span>
        </div>
        <div class="w-full bg-gray-200 rounded-full h-2">
          <div
            class="bg-indigo-600 h-2 rounded-full transition-all duration-300"
            [style.width.%]="(currentStep / totalSteps) * 100"
          ></div>
        </div>
      </div>

      <div class="card">
        <!-- Step 1: Sleep -->
        @if (currentStep === 1) {
          <h2 class="text-xl font-bold mb-2">Tus horas de sueño</h2>
          <p class="text-gray-500 mb-6">Cuéntanos sobre tu rutina de sueño para optimizar tu horario.</p>

          <div class="space-y-4">
            <div>
              <label class="label-text">¿A qué hora te despiertas?</label>
              <input type="time" [(ngModel)]="data.wakeUpTime" class="input-field" />
            </div>
            <div>
              <label class="label-text">¿A qué hora te vas a dormir?</label>
              <input type="time" [(ngModel)]="data.bedTime" class="input-field" />
            </div>
            <div>
              <label class="label-text">¿Cuántas horas quieres dormir?</label>
              <input type="range" [(ngModel)]="data.sleepHours" min="4" max="12" step="0.5"
                class="w-full accent-indigo-600" />
              <span class="text-sm text-gray-600">{{ data.sleepHours }} horas</span>
            </div>
          </div>
        }

        <!-- Step 2: Energy -->
        @if (currentStep === 2) {
          <h2 class="text-xl font-bold mb-2">Tus niveles de energía</h2>
          <p class="text-gray-500 mb-6">¿Cuándo te sientes con más y menos energía?</p>

          <div class="space-y-4">
            <div>
              <label class="label-text">Hora de máxima energía - Inicio</label>
              <input type="time" [(ngModel)]="data.peakEnergyStart" class="input-field" />
            </div>
            <div>
              <label class="label-text">Hora de máxima energía - Fin</label>
              <input type="time" [(ngModel)]="data.peakEnergyEnd" class="input-field" />
            </div>
            <div>
              <label class="label-text">Hora de baja energía - Inicio (opcional)</label>
              <input type="time" [(ngModel)]="data.lowEnergyStart" class="input-field" />
            </div>
            <div>
              <label class="label-text">Hora de baja energía - Fin (opcional)</label>
              <input type="time" [(ngModel)]="data.lowEnergyEnd" class="input-field" />
            </div>
          </div>
        }

        <!-- Step 3: Lifestyle & Work -->
        @if (currentStep === 3) {
          <h2 class="text-xl font-bold mb-2">Estilo de vida y trabajo</h2>
          <p class="text-gray-500 mb-6">Cuéntanos sobre tu rutina diaria.</p>

          <div class="space-y-4">
            <div>
              <label class="label-text">Estilo de vida</label>
              <div class="grid grid-cols-3 gap-3">
                @for (option of lifestyleOptions; track option.value) {
                  <button
                    (click)="data.lifestyle = option.value"
                    [class]="data.lifestyle === option.value
                      ? 'p-3 rounded-lg border-2 border-indigo-500 bg-indigo-50 text-center'
                      : 'p-3 rounded-lg border-2 border-gray-200 hover:border-gray-300 text-center'"
                  >
                    <div class="text-2xl mb-1">{{ option.icon }}</div>
                    <div class="text-sm font-medium">{{ option.label }}</div>
                  </button>
                }
              </div>
            </div>

            <div>
              <label class="label-text">Tipo de trabajo</label>
              <select [(ngModel)]="data.workType" class="input-field">
                <option value="">Selecciona...</option>
                <option value="remote">Remoto</option>
                <option value="office">Oficina</option>
                <option value="hybrid">Híbrido</option>
                <option value="student">Estudiante</option>
                <option value="freelance">Freelance</option>
              </select>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="label-text">Hora inicio trabajo</label>
                <input type="time" [(ngModel)]="data.workStart" class="input-field" />
              </div>
              <div>
                <label class="label-text">Hora fin trabajo</label>
                <input type="time" [(ngModel)]="data.workEnd" class="input-field" />
              </div>
            </div>

            <div>
              <label class="label-text">Días laborales</label>
              <div class="flex flex-wrap gap-2">
                @for (day of daysOfWeek; track day.value) {
                  <button
                    (click)="toggleDay(day.value)"
                    [class]="data.workDays.includes(day.value)
                      ? 'px-3 py-2 rounded-lg bg-indigo-600 text-white text-sm'
                      : 'px-3 py-2 rounded-lg bg-gray-100 text-gray-600 text-sm hover:bg-gray-200'"
                  >
                    {{ day.label }}
                  </button>
                }
              </div>
            </div>
          </div>
        }

        <!-- Step 4: Goals & Interests -->
        @if (currentStep === 4) {
          <h2 class="text-xl font-bold mb-2">Objetivos e intereses</h2>
          <p class="text-gray-500 mb-6">¿Qué quieres lograr? Selecciona todo lo que aplique.</p>

          <div class="space-y-6">
            <div>
              <label class="label-text">Objetivos</label>
              <div class="grid grid-cols-2 gap-3">
                @for (goal of goalOptions; track goal.value) {
                  <button
                    (click)="toggleGoal(goal.value)"
                    [class]="data.goals.includes(goal.value)
                      ? 'p-3 rounded-lg border-2 border-indigo-500 bg-indigo-50 text-left'
                      : 'p-3 rounded-lg border-2 border-gray-200 hover:border-gray-300 text-left'"
                  >
                    <span class="text-lg mr-2">{{ goal.icon }}</span>
                    <span class="text-sm font-medium">{{ goal.label }}</span>
                  </button>
                }
              </div>
            </div>

            <div>
              <label class="label-text">Intereses / Actividades que disfrutas</label>
              <div class="grid grid-cols-2 gap-3">
                @for (interest of interestOptions; track interest.value) {
                  <button
                    (click)="toggleInterest(interest.value)"
                    [class]="data.interests.includes(interest.value)
                      ? 'p-3 rounded-lg border-2 border-indigo-500 bg-indigo-50 text-left'
                      : 'p-3 rounded-lg border-2 border-gray-200 hover:border-gray-300 text-left'"
                  >
                    <span class="text-lg mr-2">{{ interest.icon }}</span>
                    <span class="text-sm font-medium">{{ interest.label }}</span>
                  </button>
                }
              </div>
            </div>
          </div>
        }

        <!-- Step 5: Meals & Exercise -->
        @if (currentStep === 5) {
          <h2 class="text-xl font-bold mb-2">Comidas y ejercicio</h2>
          <p class="text-gray-500 mb-6">Tus horarios de comida y preferencias de ejercicio.</p>

          <div class="space-y-4">
            <div>
              <label class="label-text">Preferencia de ejercicio</label>
              <div class="grid grid-cols-2 gap-3">
                @for (pref of exerciseOptions; track pref.value) {
                  <button
                    (click)="data.exercisePreference = pref.value"
                    [class]="data.exercisePreference === pref.value
                      ? 'p-3 rounded-lg border-2 border-indigo-500 bg-indigo-50 text-center'
                      : 'p-3 rounded-lg border-2 border-gray-200 hover:border-gray-300 text-center'"
                  >
                    <div class="text-sm font-medium">{{ pref.label }}</div>
                  </button>
                }
              </div>
            </div>

            <div class="grid grid-cols-3 gap-4">
              <div>
                <label class="label-text">Desayuno</label>
                <input type="time" [(ngModel)]="data.mealTimes.breakfast" class="input-field" />
              </div>
              <div>
                <label class="label-text">Almuerzo</label>
                <input type="time" [(ngModel)]="data.mealTimes.lunch" class="input-field" />
              </div>
              <div>
                <label class="label-text">Cena</label>
                <input type="time" [(ngModel)]="data.mealTimes.dinner" class="input-field" />
              </div>
            </div>
          </div>
        }

        <!-- Step 6: Fixed Commitments -->
        @if (currentStep === 6) {
          <h2 class="text-xl font-bold mb-2">Compromisos fijos</h2>
          <p class="text-gray-500 mb-6">Agrega actividades que no se pueden mover (opcional).</p>

          <div class="space-y-4">
            @for (commitment of data.fixedCommitments; track $index; let i = $index) {
              <div class="p-4 bg-gray-50 rounded-lg space-y-3">
                <div class="flex justify-between items-center">
                  <span class="font-medium text-sm">Compromiso {{ i + 1 }}</span>
                  <button (click)="removeCommitment(i)" class="text-red-500 text-sm hover:underline">
                    Eliminar
                  </button>
                </div>
                <input type="text" [(ngModel)]="commitment.name" placeholder="Nombre (ej: Clase de yoga)"
                  class="input-field" />
                <div class="grid grid-cols-2 gap-3">
                  <input type="time" [(ngModel)]="commitment.start" class="input-field" />
                  <input type="time" [(ngModel)]="commitment.end" class="input-field" />
                </div>
                <select [(ngModel)]="commitment.category" class="input-field">
                  <option value="work">Trabajo</option>
                  <option value="study">Estudio</option>
                  <option value="personal">Personal</option>
                </select>
                <div class="flex flex-wrap gap-2">
                  @for (day of daysOfWeek; track day.value) {
                    <button
                      (click)="toggleCommitmentDay(i, day.value)"
                      [class]="commitment.days.includes(day.value)
                        ? 'px-2 py-1 rounded bg-indigo-600 text-white text-xs'
                        : 'px-2 py-1 rounded bg-gray-200 text-gray-600 text-xs'"
                    >
                      {{ day.short }}
                    </button>
                  }
                </div>
              </div>
            }

            <button (click)="addCommitment()" class="btn-secondary w-full">
              + Agregar compromiso
            </button>
          </div>
        }

        <!-- Navigation -->
        <div class="flex justify-between mt-8">
          <button
            (click)="prevStep()"
            class="btn-secondary"
            [class.invisible]="currentStep === 1"
          >
            Anterior
          </button>

          @if (currentStep < totalSteps) {
            <button (click)="nextStep()" class="btn-primary">
              Siguiente
            </button>
          } @else {
            <button (click)="saveProfile()" class="btn-primary" [disabled]="saving">
              {{ saving ? 'Guardando...' : 'Guardar y generar horario' }}
            </button>
          }
        </div>
      </div>
    </div>
  `,
})
export class OnboardingComponent implements OnInit {
  currentStep = 1;
  totalSteps = 6;
  saving = false;

  stepTitles = [
    'Sueño',
    'Energía',
    'Estilo de vida',
    'Objetivos',
    'Comidas y ejercicio',
    'Compromisos fijos',
  ];

  data: OnboardingData = {
    name: '',
    wakeUpTime: '06:30',
    bedTime: '22:30',
    sleepHours: 8,
    peakEnergyStart: '09:00',
    peakEnergyEnd: '12:00',
    lowEnergyStart: '14:00',
    lowEnergyEnd: '15:00',
    lifestyle: 'balanced',
    workType: 'remote',
    workStart: '09:00',
    workEnd: '17:00',
    workDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    goals: [],
    interests: [],
    exercisePreference: 'morning',
    mealTimes: { breakfast: '07:30', lunch: '12:30', dinner: '19:30' },
    fixedCommitments: [],
  };

  lifestyleOptions = [
    { value: 'active', label: 'Activo', icon: '🏃' },
    { value: 'balanced', label: 'Equilibrado', icon: '⚖️' },
    { value: 'sedentary', label: 'Sedentario', icon: '💻' },
  ];

  goalOptions = [
    { value: 'productivity', label: 'Productividad', icon: '🎯' },
    { value: 'fitness', label: 'Fitness', icon: '💪' },
    { value: 'wellness', label: 'Bienestar', icon: '🧘' },
    { value: 'learning', label: 'Aprendizaje', icon: '📚' },
    { value: 'social', label: 'Vida social', icon: '👥' },
    { value: 'creativity', label: 'Creatividad', icon: '🎨' },
  ];

  interestOptions = [
    { value: 'exercise', label: 'Ejercicio', icon: '🏋️' },
    { value: 'meditation', label: 'Meditación', icon: '🧘' },
    { value: 'reading', label: 'Lectura', icon: '📖' },
    { value: 'cooking', label: 'Cocina', icon: '🍳' },
    { value: 'music', label: 'Música', icon: '🎵' },
    { value: 'gaming', label: 'Videojuegos', icon: '🎮' },
    { value: 'socializing', label: 'Socializar', icon: '🗣️' },
    { value: 'nature', label: 'Naturaleza', icon: '🌿' },
    { value: 'arts', label: 'Artes', icon: '🖌️' },
    { value: 'languages', label: 'Idiomas', icon: '🌐' },
  ];

  exerciseOptions = [
    { value: 'morning', label: 'Mañana' },
    { value: 'afternoon', label: 'Tarde' },
    { value: 'evening', label: 'Noche' },
    { value: 'none', label: 'No hago ejercicio' },
  ];

  daysOfWeek = [
    { value: 'monday', label: 'Lunes', short: 'L' },
    { value: 'tuesday', label: 'Martes', short: 'Ma' },
    { value: 'wednesday', label: 'Miércoles', short: 'Mi' },
    { value: 'thursday', label: 'Jueves', short: 'J' },
    { value: 'friday', label: 'Viernes', short: 'V' },
    { value: 'saturday', label: 'Sábado', short: 'S' },
    { value: 'sunday', label: 'Domingo', short: 'D' },
  ];

  constructor(
    private api: ApiService,
    private router: Router
  ) {}

  async ngOnInit() {
    try {
      const response: any = await this.api.getProfile();
      if (response?.success && response.data) {
        // Pre-fill with existing profile data
        const p = response.data;
        this.data = {
          name: p.name || '',
          wakeUpTime: p.wakeUpTime || '06:30',
          bedTime: p.bedTime || '22:30',
          sleepHours: p.sleepHours || 8,
          peakEnergyStart: p.peakEnergyStart || '09:00',
          peakEnergyEnd: p.peakEnergyEnd || '12:00',
          lowEnergyStart: p.lowEnergyStart || '14:00',
          lowEnergyEnd: p.lowEnergyEnd || '15:00',
          lifestyle: p.lifestyle || 'balanced',
          workType: p.workType || 'remote',
          workStart: p.workStart || '09:00',
          workEnd: p.workEnd || '17:00',
          workDays: p.workDays || ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
          goals: p.goals || [],
          interests: p.interests || [],
          exercisePreference: p.exercisePreference || 'morning',
          mealTimes: p.mealTimes || { breakfast: '07:30', lunch: '12:30', dinner: '19:30' },
          fixedCommitments: p.fixedCommitments || [],
        };
      }
    } catch {
      // No profile yet, use defaults
    }
  }

  nextStep() {
    if (this.currentStep < this.totalSteps) {
      this.currentStep++;
    }
  }

  prevStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  toggleDay(day: string) {
    const idx = this.data.workDays.indexOf(day);
    if (idx >= 0) {
      this.data.workDays.splice(idx, 1);
    } else {
      this.data.workDays.push(day);
    }
  }

  toggleGoal(goal: string) {
    const idx = this.data.goals.indexOf(goal);
    if (idx >= 0) {
      this.data.goals.splice(idx, 1);
    } else {
      this.data.goals.push(goal);
    }
  }

  toggleInterest(interest: string) {
    const idx = this.data.interests.indexOf(interest);
    if (idx >= 0) {
      this.data.interests.splice(idx, 1);
    } else {
      this.data.interests.push(interest);
    }
  }

  addCommitment() {
    this.data.fixedCommitments.push({
      name: '',
      start: '09:00',
      end: '10:00',
      days: [],
      category: 'personal',
    });
  }

  removeCommitment(index: number) {
    this.data.fixedCommitments.splice(index, 1);
  }

  toggleCommitmentDay(commitmentIndex: number, day: string) {
    const days = this.data.fixedCommitments[commitmentIndex].days;
    const idx = days.indexOf(day);
    if (idx >= 0) {
      days.splice(idx, 1);
    } else {
      days.push(day);
    }
  }

  async saveProfile() {
    this.saving = true;
    try {
      await this.api.saveProfile(this.data);
      this.router.navigate(['/dashboard']);
    } catch (err: any) {
      console.error('Failed to save profile:', err);
      alert('Error al guardar el perfil. Intenta de nuevo.');
    } finally {
      this.saving = false;
    }
  }
}
