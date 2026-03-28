import { Component, Input } from '@angular/core';
import type { AppTheme } from '../../../core/services/theme.service';

@Component({
  selector: 'app-calendar-skeleton',
  standalone: true,
  template: `
    <div [class]="shellClass">
      <!-- Header -->
      <div [class]="headerClass">
        <div>
          <div [class]="shimmerClass + ' w-40 h-5 rounded-md'"></div>
          <div [class]="shimmerClass + ' w-56 h-3 rounded-md mt-2 opacity-60'"></div>
        </div>
        <div class="flex items-center gap-3">
          <div [class]="shimmerClass + ' w-20 h-3 rounded-md opacity-60'"></div>
          <div [class]="shimmerClass + ' w-8 h-8 rounded-lg'"></div>
        </div>
      </div>

      <!-- Content -->
      <div class="overflow-hidden h-[calc(100%-57px)]">
        <div class="min-w-[1020px]">
          <!-- Day headers -->
          <div class="grid sticky top-0 z-20" [style.gridTemplateColumns]="gridCols">
            <div [class]="timeColClass">
              <div [class]="shimmerClass + ' w-10 h-3 rounded opacity-50 mx-auto'"></div>
            </div>
            @for (i of days; track i) {
              <div [class]="dayHeaderClass">
                <div [class]="shimmerClass + ' w-12 h-3 rounded opacity-50 mx-auto'"></div>
                <div [class]="shimmerClass + ' w-14 h-4 rounded mt-1.5 opacity-70 mx-auto'"></div>
              </div>
            }
          </div>

          <!-- Grid body -->
          <div class="grid relative" [style.gridTemplateColumns]="gridCols">
            <!-- Time column -->
            <div [class]="timeColBodyClass" [style.height.px]="dayHeightPx">
              @for (hour of hours; track hour) {
                <div class="absolute inset-x-0" [style.top.px]="hour * hourHeightPx">
                  <div [class]="shimmerClass + ' w-10 h-2.5 rounded opacity-40 ml-2'"></div>
                </div>
              }
            </div>

            <!-- Day columns with skeleton blocks -->
            @for (i of days; track i; let di = $index) {
              <div [class]="dayColClass" [style.height.px]="dayHeightPx">
                @for (hour of hours; track hour) {
                  <div class="absolute inset-x-0 border-t" [class]="hourLineClass" [style.top.px]="hour * hourHeightPx"></div>
                }
                @for (block of skeletonBlocks[di]; track block.top) {
                  <div
                    class="absolute left-1 right-1 rounded-lg animate-pulse"
                    [class]="blockClass"
                    [style.top.px]="block.top"
                    [style.height.px]="block.height"
                  >
                    <div [class]="shimmerClass + ' w-3/4 h-3 rounded mb-1.5'"></div>
                    <div [class]="shimmerClass + ' w-1/2 h-2.5 rounded opacity-60'"></div>
                  </div>
                }
              </div>
            }
          </div>
        </div>
      </div>
    </div>
  `,
})
export class CalendarSkeletonComponent {
  @Input() theme: AppTheme = 'light';

  readonly hourHeightPx = 56;
  readonly dayHeightPx = 24 * 56;
  readonly hours = Array.from({ length: 25 }, (_, i) => i);
  readonly days = Array.from({ length: 7 }, (_, i) => i);

  readonly skeletonBlocks: { top: number; height: number }[][] = [
    [{ top: 8 * 56, height: 2 * 56 }, { top: 14 * 56, height: 1.5 * 56 }],
    [{ top: 9 * 56, height: 3 * 56 }],
    [{ top: 7 * 56, height: 1.5 * 56 }, { top: 12 * 56, height: 2 * 56 }, { top: 18 * 56, height: 1 * 56 }],
    [{ top: 10 * 56, height: 4 * 56 }],
    [{ top: 8 * 56, height: 2 * 56 }, { top: 15 * 56, height: 2.5 * 56 }],
    [{ top: 9 * 56, height: 1.5 * 56 }, { top: 13 * 56, height: 3 * 56 }],
    [{ top: 10 * 56, height: 2 * 56 }],
  ];

  get gridCols(): string {
    return '72px repeat(7, minmax(130px, 1fr))';
  }

  get shellClass(): string {
    return this.theme === 'light'
      ? 'h-[calc(100vh-2rem)] rounded-2xl border border-[#d8d4f2] bg-[#f8f6ff] shadow-sm'
      : 'h-[calc(100vh-2rem)] rounded-2xl border border-[#4a3f6b] bg-[#2a2438] shadow-sm';
  }

  get headerClass(): string {
    return this.theme === 'light'
      ? 'border-b border-[#d8d4f2] px-4 py-3 flex items-center justify-between bg-[#f3efff] rounded-t-2xl'
      : 'border-b border-[#4a3f6b] px-4 py-3 flex items-center justify-between bg-[#322b4a] rounded-t-2xl';
  }

  get shimmerClass(): string {
    return this.theme === 'light'
      ? 'bg-[#e8e2ff] animate-pulse'
      : 'bg-[#3d3558] animate-pulse';
  }

  get blockClass(): string {
    return this.theme === 'light'
      ? 'bg-[#ece7ff] border border-[#d8d4f2] p-2 overflow-hidden'
      : 'bg-[#3d3558] border border-[#4a3f6b] p-2 overflow-hidden';
  }

  get timeColClass(): string {
    return this.theme === 'light'
      ? 'p-2 border-r border-[#d8d4f2] bg-[#f8f6ff]'
      : 'p-2 border-r border-[#4a3f6b] bg-[#2a2438]';
  }

  get timeColBodyClass(): string {
    return this.theme === 'light'
      ? 'border-r border-[#d8d4f2] relative bg-[#f8f6ff]'
      : 'border-r border-[#4a3f6b] relative bg-[#2a2438]';
  }

  get dayHeaderClass(): string {
    return this.theme === 'light'
      ? 'p-2 text-left border-r border-[#d8d4f2]'
      : 'p-2 text-left border-r border-[#4a3f6b]';
  }

  get dayColClass(): string {
    return this.theme === 'light'
      ? 'relative border-r border-[#d8d4f2] bg-[#fcfbff]'
      : 'relative border-r border-[#4a3f6b] bg-[#2f2840]';
  }

  get hourLineClass(): string {
    return this.theme === 'light'
      ? 'border-[#ece7ff]'
      : 'border-[#3d3558]';
  }
}
