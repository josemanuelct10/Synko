import { Injectable, signal } from '@angular/core';

export type ThemeMode = 'light' | 'dark';

const STORAGE_KEY = 'synko-theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly mode = signal<ThemeMode>('dark');

  constructor() {
    const initialMode = this.resolveInitialMode();
    this.applyMode(initialMode, false);
  }

  setMode(mode: ThemeMode): void {
    this.applyMode(mode, true);
  }

  private resolveInitialMode(): ThemeMode {
    if (typeof window === 'undefined') {
      return 'dark';
    }

    const storedMode = localStorage.getItem(STORAGE_KEY);
    if (storedMode === 'light' || storedMode === 'dark') {
      return storedMode;
    }

    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  private applyMode(mode: ThemeMode, persist: boolean): void {
    this.mode.set(mode);

    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', mode);
    }

    if (persist && typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, mode);
    }
  }
}
