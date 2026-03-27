import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { SupabaseService } from '../../../core/services/supabase.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="min-h-[calc(100vh-73px)] flex items-center justify-center px-4">
      <div class="card max-w-md w-full">
        <h1 class="text-2xl font-bold text-center mb-2">Crea tu cuenta</h1>
        <p class="text-gray-500 text-center mb-8">Comienza a optimizar tu día</p>

        @if (errorMessage) {
          <div class="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">
            {{ errorMessage }}
          </div>
        }

        @if (successMessage) {
          <div class="bg-green-50 text-green-600 p-3 rounded-lg mb-4 text-sm">
            {{ successMessage }}
          </div>
        }

        <form (ngSubmit)="onSubmit()" class="space-y-4">
          <div>
            <label class="label-text">Nombre</label>
            <input
              type="text"
              [(ngModel)]="name"
              name="name"
              class="input-field"
              placeholder="Tu nombre"
            />
          </div>

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
              placeholder="Mínimo 6 caracteres"
              required
            />
          </div>

          <div>
            <label class="label-text">Confirmar contraseña</label>
            <input
              type="password"
              [(ngModel)]="confirmPassword"
              name="confirmPassword"
              class="input-field"
              placeholder="Repite tu contraseña"
              required
            />
          </div>

          <button
            type="submit"
            class="btn-primary w-full"
            [disabled]="loading"
          >
            {{ loading ? 'Creando cuenta...' : 'Crear cuenta' }}
          </button>
        </form>

        <p class="text-center text-sm text-gray-500 mt-6">
          ¿Ya tienes cuenta?
          <a routerLink="/auth/login" class="text-indigo-600 hover:underline">Inicia sesión</a>
        </p>
      </div>
    </div>
  `,
})
export class RegisterComponent {
  name = '';
  email = '';
  password = '';
  confirmPassword = '';
  loading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private supabase: SupabaseService,
    private router: Router
  ) {}

  async onSubmit() {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.email || !this.password) {
      this.errorMessage = 'Por favor completa todos los campos obligatorios';
      return;
    }

    if (this.password.length < 6) {
      this.errorMessage = 'La contraseña debe tener al menos 6 caracteres';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Las contraseñas no coinciden';
      return;
    }

    this.loading = true;

    try {
      await this.supabase.signUp(this.email, this.password, this.name);
      this.successMessage = 'Cuenta creada. Revisa tu email para confirmar tu cuenta.';
      setTimeout(() => this.router.navigate(['/onboarding']), 2000);
    } catch (err: any) {
      this.errorMessage = err.message || 'Error al crear la cuenta';
    } finally {
      this.loading = false;
    }
  }
}
