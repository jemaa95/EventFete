import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { signal } from '@angular/core';

export type AppLang = 'fr' | 'en' | 'ar';

const LANG_KEY = 'ef_lang';
const RTL_LANGS: AppLang[] = ['ar'];

@Injectable({ providedIn: 'root' })
export class LanguageService {
  currentLang = signal<AppLang>('fr');
  private readonly isBrowser: boolean;

  constructor(
    private translate: TranslateService,
    @Inject(PLATFORM_ID) platformId: object,
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    this.translate.addLangs(['fr', 'en', 'ar']);

    const saved = this.isBrowser ? (localStorage.getItem(LANG_KEY) as AppLang | null) : null;
    const initial: AppLang = saved && ['fr', 'en', 'ar'].includes(saved) ? saved : 'fr';
    this.use(initial);
  }

  use(lang: AppLang) {
    this.translate.use(lang);
    this.currentLang.set(lang);

    if (this.isBrowser) {
      localStorage.setItem(LANG_KEY, lang);
      document.documentElement.lang = lang;
      document.documentElement.dir = RTL_LANGS.includes(lang) ? 'rtl' : 'ltr';
    }
  }

  isRtl(): boolean {
    return RTL_LANGS.includes(this.currentLang());
  }
}
