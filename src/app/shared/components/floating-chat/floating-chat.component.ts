import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, Input, Output, ViewChild, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import type { AppTheme } from '../../../core/services/theme.service';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatAction {
  type: string;
  data: any;
}

@Component({
  selector: 'app-floating-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <!-- Floating button -->
    @if (!isOpen) {
      <button
        type="button"
        (click)="toggle()"
        class="fixed bottom-4 right-4 z-50 w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110 cursor-pointer"
        [class]="theme === 'light'
          ? 'bg-[#8dd3c7] text-[#1f2937] hover:bg-[#7bc4b7]'
          : 'bg-[#6db8a8] text-[#0f1a18] hover:bg-[#8dd3c7]'"
        aria-label="Abrir chat"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
      </button>
    }

    <!-- Chat panel -->
    @if (isOpen) {
      <div
        class="fixed bottom-4 right-4 z-50 w-[360px] h-[500px] rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300"
        [class]="theme === 'light'
          ? 'bg-[#f8f6ff] border border-[#d8d4f2]'
          : 'bg-[#2a2438] border border-[#4a3f6b]'"
      >
        <!-- Header -->
        <div
          class="flex items-center justify-between px-4 py-3 border-b shrink-0"
          [class]="theme === 'light'
            ? 'border-[#d8d4f2] bg-[#f3efff]'
            : 'border-[#4a3f6b] bg-[#322b4a]'"
        >
          <div class="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" [class]="theme === 'light' ? 'text-[#6b628e]' : 'text-[#9b8fc4]'">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            <span
              class="text-sm font-semibold"
              [class]="theme === 'light' ? 'text-[#2f2a44]' : 'text-[#f0ecff]'"
            >Asistente de horario</span>
          </div>
          <button
            type="button"
            (click)="toggle()"
            class="p-1 rounded-lg transition-colors cursor-pointer"
            [class]="theme === 'light'
              ? 'text-[#6b628e] hover:bg-[#ece7ff]'
              : 'text-[#9b8fc4] hover:bg-[#3d3558]'"
            aria-label="Cerrar chat"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <!-- Messages -->
        <div
          #messagesContainer
          class="flex-1 overflow-y-auto p-3 space-y-3"
          [class]="theme === 'light' ? 'scrollbar-theme-light' : 'scrollbar-theme-dark'"
        >
          @if (messages.length === 0) {
            <div class="flex flex-col items-center justify-center h-full text-center px-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" [class]="theme === 'light' ? 'text-[#c4bdd8]' : 'text-[#4a3f6b]'">
                <circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/>
              </svg>
              <p
                class="text-sm mt-3"
                [class]="theme === 'light' ? 'text-[#6b628e]' : 'text-[#9b8fc4]'"
              >
                Escribe para modificar tu horario.
              </p>
              <p
                class="text-xs mt-1"
                [class]="theme === 'light' ? 'text-[#a89fd0]' : 'text-[#6b6088]'"
              >
                Ej: "Estudio L-V de 7 a 8pm"
              </p>
            </div>
          }

          @for (msg of messages; track $index) {
            <div [class]="msg.role === 'user' ? 'flex justify-end' : 'flex justify-start'">
              <div
                class="max-w-[80%] rounded-2xl px-3 py-2 text-sm"
                [class]="msg.role === 'user'
                  ? (theme === 'light'
                    ? 'bg-[#8dd3c7] text-[#1f2937] rounded-br-md'
                    : 'bg-[#6db8a8] text-[#0f1a18] rounded-br-md')
                  : (theme === 'light'
                    ? 'bg-[#ece7ff] text-[#2f2a44] rounded-bl-md'
                    : 'bg-[#3d3558] text-[#e8e4f5] rounded-bl-md')"
              >
                {{ msg.content }}
              </div>
            </div>
          }

          @if (isStreaming) {
            <div class="flex justify-start">
              <div
                class="max-w-[80%] rounded-2xl rounded-bl-md px-3 py-2 text-sm"
                [class]="theme === 'light'
                  ? 'bg-[#ece7ff] text-[#2f2a44]'
                  : 'bg-[#3d3558] text-[#e8e4f5]'"
              >
                <span class="inline-flex gap-1 items-center">
                  <span class="w-1.5 h-1.5 rounded-full animate-bounce" [class]="theme === 'light' ? 'bg-[#6b628e]' : 'bg-[#9b8fc4']" style="animation-delay: 0ms"></span>
                  <span class="w-1.5 h-1.5 rounded-full animate-bounce" [class]="theme === 'light' ? 'bg-[#6b628e]' : 'bg-[#9b8fc4']" style="animation-delay: 150ms"></span>
                  <span class="w-1.5 h-1.5 rounded-full animate-bounce" [class]="theme === 'light' ? 'bg-[#6b628e]' : 'bg-[#9b8fc4']" style="animation-delay: 300ms"></span>
                </span>
              </div>
            </div>
          }
        </div>

        <!-- Input -->
        <div
          class="border-t px-3 py-2.5 shrink-0"
          [class]="theme === 'light'
            ? 'border-[#d8d4f2] bg-[#f3efff]'
            : 'border-[#4a3f6b] bg-[#322b4a]'"
        >
          <form (submit)="send()" class="flex gap-2">
            <input
              type="text"
              [(ngModel)]="input"
              name="chatInput"
              [disabled]="isStreaming"
              placeholder="Escribe un mensaje..."
              class="flex-1 rounded-xl px-3 py-2 text-sm outline-none transition-colors"
              [class]="theme === 'light'
                ? 'bg-white border border-[#d8d4f2] text-[#2f2a44] placeholder-[#a89fd0] focus:border-[#8dd3c7]'
                : 'bg-[#2a2438] border border-[#4a3f6b] text-[#e8e4f5] placeholder-[#6b6088] focus:border-[#6db8a8]'"
            />
            <button
              type="submit"
              [disabled]="!input.trim() || isStreaming"
              class="w-9 h-9 rounded-xl flex items-center justify-center transition-colors shrink-0 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              [class]="theme === 'light'
                ? 'bg-[#8dd3c7] text-[#1f2937] hover:bg-[#7bc4b7]'
                : 'bg-[#6db8a8] text-[#0f1a18] hover:bg-[#8dd3c7]'"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            </button>
          </form>
        </div>
      </div>
    }
  `,
})
export class FloatingChatComponent {
  @Input() theme: AppTheme = 'light';
  @Input() profile: any = null;
  @Input() weekDays: any[] = [];
  @Output() actionsExecuted = new EventEmitter<ChatAction[]>();

  @ViewChild('messagesContainer') messagesContainer!: ElementRef;

  isOpen = false;
  isStreaming = false;
  input = '';
  messages: ChatMessage[] = [];

  constructor(
    private api: ApiService,
    private cdr: ChangeDetectorRef
  ) {}

  toggle(): void {
    this.isOpen = !this.isOpen;
  }

  async send(): Promise<void> {
    const text = this.input.trim();
    if (!text || this.isStreaming) return;

    this.input = '';
    this.messages.push({ role: 'user', content: text });
    this.isStreaming = true;
    this.scrollToBottom();

    const assistantMessage: ChatMessage = { role: 'assistant', content: '' };
    this.messages.push(assistantMessage);

    try {
      const context = {
        profile: this.profile,
        schedule: this.weekDays.map((day) => ({
          id: day.id,
          date: day.date,
          dayOfWeek: day.dayOfWeek,
          blocks: day.schedule || [],
        })),
      };

      const history = this.messages.slice(0, -1).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const { stream } = await this.api.sendChatMessage({
        message: text,
        context,
        history,
      });

      const actions: ChatAction[] = [];

      for await (const chunk of stream) {
        if (chunk.type === 'token' && chunk.content) {
          assistantMessage.content += chunk.content;
          this.cdr.detectChanges();
          this.scrollToBottom();
        } else if (chunk.type === 'actions' && chunk.data) {
          actions.push(...chunk.data);
        }
      }

      if (actions.length > 0) {
        this.actionsExecuted.emit(actions);
      }
    } catch {
      assistantMessage.content = 'Error al procesar tu mensaje. Intenta de nuevo.';
    } finally {
      this.isStreaming = false;
      this.cdr.detectChanges();
    }
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      if (this.messagesContainer) {
        const el = this.messagesContainer.nativeElement;
        el.scrollTop = el.scrollHeight;
      }
    }, 50);
  }
}
