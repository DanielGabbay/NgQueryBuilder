import { Injectable, signal, computed } from '@angular/core';
import { translations } from './translations';

export type Language = 'en' | 'he';

@Injectable({
  providedIn: 'root',
})
export class TranslationService {
  currentLang = signal<Language>('he');

  t = computed(() => translations[this.currentLang()]);

  setLanguage(lang: Language) {
    this.currentLang.set(lang);
  }
}
