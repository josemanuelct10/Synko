import { DOCUMENT } from '@angular/common';
import { Injectable, effect, inject, signal } from '@angular/core';
import en from './locales/en.json';
import es from './locales/es.json';

export type Locale = 'es' | 'en';

type TranslationValue = string;
type TranslationParams = Record<string, string | number>;

type TranslationTree = {
  [key: string]: TranslationValue | TranslationTree;
};

const STORAGE_KEY = 'synko_locale';

const translations: Record<Locale, TranslationTree> = {
  es: es as TranslationTree,
  en: en as TranslationTree
};

@Injectable({ providedIn: 'root' })
export class I18nService {
  private readonly document = inject(DOCUMENT);
  readonly locale = signal<Locale>(this.getInitialLocale());

  constructor() {
    effect(() => {
      const locale = this.locale();
      localStorage.setItem(STORAGE_KEY, locale);
      this.document.documentElement.lang = locale;
    });
  }

  setLocale(locale: Locale): void {
    this.locale.set(locale);
  }

  t(key: string, params?: TranslationParams): string {
    const template = this.resolveKey(translations[this.locale()], key);

    if (!template) {
      return key;
    }

    return this.interpolate(template, params);
  }

  private getInitialLocale(): Locale {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === 'en' || stored === 'es' ? stored : 'es';
  }

  private resolveKey(tree: TranslationTree, key: string): string | null {
    const segments = key.split('.');
    let current: TranslationTree | string = tree;

    for (const segment of segments) {
      if (typeof current === 'string') {
        return null;
      }

      current = current[segment] as TranslationTree | string;

      if (current === undefined) {
        return null;
      }
    }

    return typeof current === 'string' ? current : null;
  }

  private interpolate(template: string, params?: TranslationParams): string {
    if (!params) {
      return template;
    }

    return Object.entries(params).reduce(
      (message, [key, value]) => message.replaceAll(`{${key}}`, String(value)),
      template
    );
  }
}
