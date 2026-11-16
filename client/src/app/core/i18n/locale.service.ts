import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { Title } from '@angular/platform-browser';
import {
  fillTemplate,
  L10nText,
  Locale,
  localeDir,
  localeHtmlLang,
  pickL10n,
} from './locale.types';
import { UI_MESSAGES, type UiMessageKey } from './messages';

const STORAGE_KEY = 'yerushalmi.locale';

/** Prefer stable landmarks near the viewport focus when languages reflow. */
const SECTION_SELECTOR = 'section[id]';
const ANCHOR_SELECTOR =
  'section[id], article, h1, h2, h3, h4, .wizard__title, .video-card, .package-card, .configurator, .price-summary';

/** Settle passes after locale flip. Mobile keeps correcting longer (wrap + decode). */
const DESKTOP_RESTORE_MS = [0, 32, 80] as const;
const MOBILE_RESTORE_MS = [0, 32, 80, 160, 280, 450, 700] as const;
/** Hide body only briefly, then keep correcting while visible. */
const REVEAL_AFTER_MS = 100;

function readStoredLocale(): Locale {
  if (typeof localStorage === 'undefined') return 'he';
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw === 'en' || raw === 'he' ? raw : 'he';
  } catch {
    return 'he';
  }
}

@Injectable({ providedIn: 'root' })
export class LocaleService {
  private readonly title = inject(Title);

  readonly locale = signal<Locale>(readStoredLocale());
  readonly dir = computed(() => localeDir(this.locale()));
  readonly htmlLang = computed(() => localeHtmlLang(this.locale()));
  readonly isHebrew = computed(() => this.locale() === 'he');
  readonly isEnglish = computed(() => this.locale() === 'en');

  constructor() {
    effect(() => {
      const locale = this.locale();
      const dir = localeDir(locale);
      const lang = localeHtmlLang(locale);
      if (typeof document === 'undefined') return;
      document.documentElement.lang = lang;
      document.documentElement.dir = dir;
      document.documentElement.dataset['locale'] = locale;
      this.title.setTitle(this.t('site.title'));
      try {
        localStorage.setItem(STORAGE_KEY, locale);
      } catch {
        // Ignore private-mode / quota errors.
      }
    });
  }

  setLocale(locale: Locale): void {
    if (this.locale() === locale) return;
    this.applyLocalePreservingScroll(locale);
  }

  toggleLocale(): void {
    this.setLocale(this.locale() === 'he' ? 'en' : 'he');
  }

  /**
   * Flip lang/dir while keeping the same on-screen content in view.
   * Absolute scrollY jumps when HE/EN blocks have different heights, so we
   * re-anchor to a stable section under the viewport focus point and keep
   * correcting until mobile layout (wrap + image decode) settles.
   */
  private applyLocalePreservingScroll(locale: Locale): void {
    if (typeof document === 'undefined') {
      this.locale.set(locale);
      return;
    }

    const root = document.documentElement;
    const focusX = Math.round(window.innerWidth / 2);
    const focusY = Math.round(Math.min(window.innerHeight * 0.42, window.innerHeight - 96));
    const hit = this.viewportContentHit(focusX, focusY);
    const section = (hit?.closest(SECTION_SELECTOR) as HTMLElement | null) ?? null;
    const anchor =
      section ??
      (hit?.closest(ANCHOR_SELECTOR) as HTMLElement | null) ??
      hit;
    const anchorId = section?.id || (anchor?.id ? anchor.id : null);
    const anchorOffset = anchor?.getBoundingClientRect().top ?? null;

    const nested = Array.from(
      document.querySelectorAll<HTMLElement>(
        '.configurator__body, .price-summary, .summary-step__dialog-body, .file-upload__gallery, .header__mobile-nav, .portfolio__track',
      ),
    ).map((el) => ({ el, top: el.scrollTop, left: el.scrollLeft }));

    const isMobile = window.matchMedia('(max-width: 767px)').matches;
    const delays = isMobile ? MOBILE_RESTORE_MS : DESKTOP_RESTORE_MS;

    root.classList.add('scroll-restoring');
    this.locale.set(locale);

    const resolveAnchor = (): HTMLElement | null => {
      if (anchorId) {
        const byId = document.getElementById(anchorId);
        if (byId) return byId;
      }
      if (anchor?.isConnected) return anchor;
      return this.viewportContentHit(focusX, focusY)?.closest(SECTION_SELECTOR) as HTMLElement | null;
    };

    const restore = (): void => {
      const target = resolveAnchor();
      if (target && anchorOffset !== null) {
        const delta = target.getBoundingClientRect().top - anchorOffset;
        if (Math.abs(delta) >= 1) {
          window.scrollBy(0, delta);
        }
      }
      for (const entry of nested) {
        if (!entry.el.isConnected) continue;
        entry.el.scrollTop = entry.top;
        entry.el.scrollLeft = entry.left;
      }
    };

    let revealed = false;
    const reveal = (): void => {
      if (revealed) return;
      revealed = true;
      root.classList.remove('scroll-restoring');
    };

    // Locale text updates on the next CD turn — never trust a sync restore alone.
    for (const ms of delays) {
      window.setTimeout(() => {
        restore();
        if (ms >= REVEAL_AFTER_MS) reveal();
        if (ms === delays[delays.length - 1]) {
          restore();
          reveal();
        }
      }, ms);
    }

    requestAnimationFrame(() => {
      restore();
      requestAnimationFrame(restore);
    });
  }

  /** Pick a content node under the focus point, skipping sticky header chrome. */
  private viewportContentHit(focusX: number, focusY: number): HTMLElement | null {
    const stack =
      typeof document.elementsFromPoint === 'function'
        ? document.elementsFromPoint(focusX, focusY)
        : [document.elementFromPoint(focusX, focusY)];

    for (const node of stack) {
      if (!(node instanceof HTMLElement)) continue;
      if (node.closest('.header, .header__bar, .header__mobile-nav')) continue;
      const style = window.getComputedStyle(node);
      if (style.position === 'fixed' || style.position === 'sticky') continue;
      return node;
    }
    return null;
  }

  /** Translate a UI dictionary key. */
  t(key: UiMessageKey): string {
    return pickL10n(UI_MESSAGES[key], this.locale());
  }

  /** Translate a key and fill `{token}` placeholders. */
  tf(key: UiMessageKey, vars: Record<string, string | number>): string {
    return fillTemplate(this.t(key), vars);
  }

  /** Resolve a bilingual value for the active locale. */
  tx(value: L10nText | string | null | undefined, fallback = ''): string {
    return pickL10n(value, this.locale(), fallback);
  }

  /** Resolve a bilingual value and fill placeholders. */
  txf(
    value: L10nText | string | null | undefined,
    vars: Record<string, string | number>,
    fallback = '',
  ): string {
    return fillTemplate(this.tx(value, fallback), vars);
  }
}
