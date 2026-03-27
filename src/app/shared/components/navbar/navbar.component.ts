import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SupabaseService } from '../../../core/services/supabase.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <nav class="bg-white border-b border-gray-200 px-6 py-4">
      <div class="max-w-7xl mx-auto flex items-center justify-between">
        <a routerLink="/dashboard" class="flex items-center gap-2">
          <span class="text-2xl font-bold text-indigo-600">ScheduleAI</span>
        </a>

        @if (isAuthenticated) {
          <div class="flex items-center gap-4">
            <a routerLink="/dashboard" class="text-gray-600 hover:text-indigo-600 transition-colors">
              Mi Horario
            </a>
            <a routerLink="/onboarding" class="text-gray-600 hover:text-indigo-600 transition-colors">
              Perfil
            </a>
            <button
              (click)="signOut()"
              class="text-sm text-gray-500 hover:text-red-500 transition-colors"
            >
              Cerrar sesión
            </button>
          </div>
        } @else {
          <div class="flex items-center gap-3">
            <a routerLink="/auth/login" class="btn-secondary text-sm">
              Iniciar sesión
            </a>
            <a routerLink="/auth/register" class="btn-primary text-sm">
              Registrarse
            </a>
          </div>
        }
      </div>
    </nav>
  `,
})
export class NavbarComponent {
  constructor(
    private supabase: SupabaseService,
    private router: Router
  ) {}

  get isAuthenticated(): boolean {
    return this.supabase.isAuthenticated;
  }

  async signOut() {
    await this.supabase.signOut();
    this.router.navigate(['/auth/login']);
  }
}
