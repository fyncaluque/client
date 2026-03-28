import { Component, EventEmitter, Input, Output } from '@angular/core';
import type { AppTheme } from '../../../core/services/theme.service';

@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  template: `
    <button
      type="button"
      role="switch"
      [attr.aria-checked]="theme === 'dark'"
      [attr.aria-label]="theme === 'light' ? 'Activar modo oscuro' : 'Activar modo claro'"
      (click)="toggle()"
      class="flex items-center rounded-full px-1.5 py-1.5 transition-all duration-300 cursor-pointer border-2"
      [class]="theme === 'light'
        ? 'border-[#d8d4f2] bg-[#f0ecff]'
        : 'border-[#4a3f6b] bg-[#322b4a]'"
    >
      <span class="relative w-11 h-6 rounded-full transition-colors duration-300"
        [class]="theme === 'light' ? 'bg-[#d8d4f2]' : 'bg-[#4a3f6b]'"
      >
        <span
          class="absolute top-0.5 w-5 h-5 rounded-full shadow-md flex items-center justify-center transition-all duration-300"
          [class]="theme === 'light'
            ? 'left-0.5 bg-white'
            : 'left-[22px] bg-[#e8e4f5]'"
        >
          @if (theme === 'light') {
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#e8a020" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="5"/>
              <line x1="12" y1="1" x2="12" y2="3"/>
              <line x1="12" y1="21" x2="12" y2="23"/>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
              <line x1="1" y1="12" x2="3" y2="12"/>
              <line x1="21" y1="12" x2="23" y2="12"/>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
            </svg>
          } @else {
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7c6faf" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            </svg>
          }
        </span>
      </span>
    </button>
  `,
})
export class ThemeToggleComponent {
  @Input() theme: AppTheme = 'light';
  @Output() themeChange = new EventEmitter<void>();

  toggle(): void {
    this.themeChange.emit();
  }
}
