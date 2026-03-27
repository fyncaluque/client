import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { SupabaseService } from '../../../core/services/supabase.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="min-h-[calc(100vh-73px)] flex items-center justify-center px-4">
      <div class="card max-w-md w-full">
        <h1 class="text-2xl font-bold text-center mb-2">Bienvenido de vuelta</h1>
        <p class="text-gray-500 text-center mb-8">Inicia sesión para ver tu horario</p>

        @if (errorMessage) {
          <div class="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">
            {{ errorMessage }}
          </div>
        }

        <form (ngSubmit)="onSubmit()" class="space-y-4">
          <div>
            <label class="label-text">Email</label>
            <input
              type="email"
              [(ngModel)]="email"
              name="email"
              class="input-field"
              placeholder="tu@email.com"
              required
            />
          </div>

          <div>
            <label class="label-text">Contraseña</label>
            <input
              type="password"
              [(ngModel)]="password"
              name="password"
              class="input-field"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            class="btn-primary w-full"
            [disabled]="loading"
          >
            {{ loading ? 'Iniciando sesión...' : 'Iniciar sesión' }}
          </button>
        </form>

        <button
          (click)="signInWithGoogle()"
          class="mt-4 w-full flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          [disabled]="loading"
        >
          <svg class="w-5 h-5" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continuar con Google
        </button>

        <p class="text-center text-sm text-gray-500 mt-6">
          ¿No tienes cuenta?
          <a routerLink="/auth/register" class="text-indigo-600 hover:underline">Regístrate</a>
        </p>
      </div>
    </div>
  `,
})
export class LoginComponent {
  email = '';
  password = '';
  loading = false;
  errorMessage = '';

  constructor(
    private supabase: SupabaseService,
    private router: Router
  ) {}

  async onSubmit() {
    if (!this.email || !this.password) {
      this.errorMessage = 'Por favor completa todos los campos';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    try {
      await this.supabase.signIn(this.email, this.password);
      this.router.navigate(['/dashboard']);
    } catch (err: any) {
      this.errorMessage = err.message || 'Error al iniciar sesión';
    } finally {
      this.loading = false;
    }
  }

  async signInWithGoogle() {
    try {
      await this.supabase.signInWithGoogle();
    } catch (err: any) {
      this.errorMessage = err.message || 'Error con Google Sign In';
    }
  }
}
