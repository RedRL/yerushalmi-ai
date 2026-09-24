import { afterNextRender, DestroyRef, inject, Injectable, Injector } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { debounceTime, filter, fromEvent } from 'rxjs';
import { jumpToSectionFromNav } from '../../shared/utils/scroll-to.util';
import {
  beginScrollRestoration,
  enableManualScrollRestoration,
  finishScrollRestoration,
  resetPageScrollPosition,
  restorePageScrollPosition,
  savePageScrollPosition,
} from '../../shared/utils/scroll-restoration.util';

const HOME_PATH = '/clips';
const TERMS_PATH = '/clips/terms';

@Injectable({ providedIn: 'root' })
export class ScrollRestorationService {
  private readonly destroyRef = inject(DestroyRef);
  private readonly injector = inject(Injector);
  private readonly router = inject(Router);
  private fragmentScrollToken = 0;

  init(): void {
    enableManualScrollRestoration();

    afterNextRender(() => {
      this.restoreForPath(window.location.pathname);
    }, { injector: this.injector });

    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((event) => {
        this.restoreForPath(event.urlAfterRedirects.split('?')[0] || '/');
      });

    fromEvent(window, 'scroll', { passive: true })
      .pipe(debounceTime(200), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => savePageScrollPosition(window.location.pathname));

    fromEvent(window, 'pagehide')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => savePageScrollPosition(window.location.pathname));
  }

  private restoreForPath(url: string): void {
    const pathname = url.split('?')[0].split('#')[0] || '/';
    const sectionId = (history.state as { sectionId?: string | null } | null)?.sectionId;

    if (pathname === TERMS_PATH) {
      resetPageScrollPosition(pathname);
      return;
    }

    if (pathname === HOME_PATH && sectionId) {
      this.jumpToSectionWhenReady(sectionId);
      return;
    }

    restorePageScrollPosition(pathname);
  }

  private jumpToSectionWhenReady(
    sectionId: string,
    attempt = 0,
    lastTop = -1,
    stableCount = 0,
    token = 0,
  ): void {
    const activeToken = attempt === 0 ? ++this.fragmentScrollToken : token;
    if (activeToken !== this.fragmentScrollToken) return;

    beginScrollRestoration();

    const section = document.getElementById(sectionId);
    const top = section?.offsetTop ?? -1;
    const nextStable = top > 0 && top === lastTop ? stableCount + 1 : 0;

    if (section && nextStable >= 3) {
      jumpToSectionFromNav(sectionId);
      finishScrollRestoration();
      return;
    }

    if (attempt >= 40) {
      if (section) jumpToSectionFromNav(sectionId);
      finishScrollRestoration();
      return;
    }

    setTimeout(
      () => this.jumpToSectionWhenReady(sectionId, attempt + 1, top, nextStable, activeToken),
      50,
    );
  }
}
