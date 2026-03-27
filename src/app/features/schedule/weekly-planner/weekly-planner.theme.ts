import type { AppTheme } from '../../../core/services/theme.service';

/** Clases Tailwind: colores sólidos, sin opacidad / transparencia */
export const WEEKLY_PLANNER_SKIN: Record<
  AppTheme,
  {
    shell: string;
    header: string;
    headerTitle: string;
    headerSub: string;
    sticky: string;
    colHora: string;
    dayBtn: string;
    dayBtnHover: string;
    dayBtnActive: string;
    dayLabel: string;
    dayDate: string;
    gridTimeCol: string;
    hourLine: string;
    hourLabel: string;
    dayCol: string;
    hourLineInner: string;
    blockTitle: string;
    blockMeta: string;
    regenBtn: string;
    fixedTag: string;
    dropLine: string;
    dropBadge: string;
  }
> = {
  light: {
    shell:
      'h-[calc(100vh-2rem)] rounded-2xl border border-[#d8d4f2] bg-[#f8f6ff] text-[#2f2a44] shadow-sm',
    header: 'border-b border-[#d8d4f2] px-4 py-3 flex items-center justify-between bg-[#f3efff] rounded-t-2xl',
    headerTitle: 'text-base font-semibold text-[#2f2a44]',
    headerSub: 'text-xs text-[#5f587f]',
    sticky: 'grid sticky top-0 z-20 bg-[#f3efff] border-b border-[#d8d4f2]',
    colHora:
      'p-2 text-[11px] uppercase tracking-wide text-[#6b628e] font-semibold border-r border-[#d8d4f2]',
    dayBtn: 'p-2 text-left border-r border-[#d8d4f2] transition-colors',
    dayBtnHover: 'hover:bg-[#ece7ff]',
    dayBtnActive: 'bg-[#e3dcff]',
    dayLabel: 'text-xs uppercase tracking-wide text-[#6b628e]',
    dayDate: 'text-sm font-medium text-[#312b4f]',
    gridTimeCol: 'border-r border-[#d8d4f2] relative bg-[#f8f6ff]',
    hourLine: 'absolute inset-x-0 border-t border-[#e8e2ff]',
    hourLabel: 'absolute -top-2 left-2 text-[10px] text-[#7d73a5] bg-[#f8f6ff] px-1',
    dayCol: 'relative border-r border-[#d8d4f2] bg-[#fcfbff]',
    hourLineInner: 'absolute inset-x-0 border-t border-[#ece7ff]',
    blockTitle: 'text-[11px] font-semibold truncate text-[#2f2a44]',
    blockMeta: 'text-[10px] text-[#5f587f]',
    regenBtn: 'text-[10px] text-[#25766c] hover:text-[#1f5f56]',
    fixedTag: 'text-[9px] text-[#a14f68]',
    dropLine: 'absolute left-0 right-0 border-t-2 border-[#5cb8a8] pointer-events-none z-40',
    dropBadge: 'absolute -top-3 left-1 text-[10px] px-1.5 py-0.5 rounded bg-[#8dd3c7] text-[#1f2937] font-semibold',
  },
  dark: {
    shell:
      'h-[calc(100vh-2rem)] rounded-2xl border border-[#4a3f6b] bg-[#2a2438] text-[#e8e4f5] shadow-sm',
    header: 'border-b border-[#4a3f6b] px-4 py-3 flex items-center justify-between bg-[#322b4a] rounded-t-2xl',
    headerTitle: 'text-base font-semibold text-[#f0ecff]',
    headerSub: 'text-xs text-[#a89cc8]',
    sticky: 'grid sticky top-0 z-20 bg-[#322b4a] border-b border-[#4a3f6b]',
    colHora:
      'p-2 text-[11px] uppercase tracking-wide text-[#9b8fc4] font-semibold border-r border-[#4a3f6b]',
    dayBtn: 'p-2 text-left border-r border-[#4a3f6b] transition-colors',
    dayBtnHover: 'hover:bg-[#3d3558]',
    dayBtnActive: 'bg-[#4a3f7a]',
    dayLabel: 'text-xs uppercase tracking-wide text-[#9b8fc4]',
    dayDate: 'text-sm font-medium text-[#e8e4f5]',
    gridTimeCol: 'border-r border-[#4a3f6b] relative bg-[#2a2438]',
    hourLine: 'absolute inset-x-0 border-t border-[#3d3558]',
    hourLabel: 'absolute -top-2 left-2 text-[10px] text-[#8a7eb0] bg-[#2a2438] px-1',
    dayCol: 'relative border-r border-[#4a3f6b] bg-[#2f2840]',
    hourLineInner: 'absolute inset-x-0 border-t border-[#3d3558]',
    blockTitle: 'text-[11px] font-semibold truncate text-[#1f2937]',
    blockMeta: 'text-[10px] text-[#4a4458]',
    regenBtn: 'text-[10px] text-[#1a5c54] hover:text-[#134a44]',
    fixedTag: 'text-[9px] text-[#8b3a55]',
    dropLine: 'absolute left-0 right-0 border-t-2 border-[#7dd3c1] pointer-events-none z-40',
    dropBadge: 'absolute -top-3 left-1 text-[10px] px-1.5 py-0.5 rounded bg-[#8dd3c7] text-[#1f2937] font-semibold',
  },
};

/** Relleno sólido pastel (igual en light y dark sobre fondo oscuro de celda) */
export const CATEGORY_FILL: Record<string, string> = {
  sleep: '#a8c7ff',
  morning_routine: '#ffe29a',
  exercise: '#b8f2e6',
  work: '#cbb8ff',
  meal: '#ffd6b0',
  deep_work: '#d6c6ff',
  learning: '#b7e4ff',
  creative: '#ffc6de',
  social: '#c5f5ef',
  wellness: '#d8f3c4',
  leisure: '#e7d4ff',
  chores: '#e9dfd2',
  commute: '#d3e1ff',
  break: '#ece9f4',
  evening_routine: '#ffe8b6',
  free_time: '#c9f7d4',
};

/** Bordes ligeramente más oscuros para contraste */
export const CATEGORY_BORDER_LIGHT: Record<string, string> = {
  sleep: '#7aa3ff',
  morning_routine: '#e6c76a',
  exercise: '#6bc4b8',
  work: '#a894e8',
  meal: '#e8a870',
  deep_work: '#b8a6e8',
  learning: '#7ec8f0',
  creative: '#f0a0c8',
  social: '#8dd8d0',
  wellness: '#b8e090',
  leisure: '#d0b8f0',
  chores: '#c9b8a8',
  commute: '#a8b8e8',
  break: '#c4bdd8',
  evening_routine: '#e8c878',
  free_time: '#98e8a8',
};

export const CATEGORY_BORDER_DARK: Record<string, string> = {
  sleep: '#5a7fd0',
  morning_routine: '#c9a850',
  exercise: '#4fa89c',
  work: '#8870c8',
  meal: '#c89050',
  deep_work: '#9888c8',
  learning: '#5ea8d0',
  creative: '#d080a8',
  social: '#6db8b0',
  wellness: '#98c870',
  leisure: '#b098d8',
  chores: '#a89888',
  commute: '#8898d0',
  break: '#a8a0c0',
  evening_routine: '#d0b050',
  free_time: '#78c888',
};
