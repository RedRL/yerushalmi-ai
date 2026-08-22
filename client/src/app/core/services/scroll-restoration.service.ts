import { afterNextRender, DestroyRef, inject, Injectable, Injector } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { debounceTime, filter, fromEvent } from 'rxjs';
import {
  enableManualScrollRestoration,
  resetPageScrollPosition,
  restorePageScrollPosition,
  savePageScrollPosition,
} from '../../shared/utils/scroll-restoration.util';

const TERMS_PATH = '/terms';
const MOBILE_MAX_WIDTH = '(max-width: 1023px)';

@Injectable({ providedIn: 'root' })
export class ScrollRestorationService {
  private readonly destroyRef = inject(DestroyRef);
  private readonly injector = inject(Injector);
  private readonly router = inject(Router);

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

  private restoreForPath(pathname: string): void {
    if (pathname === TERMS_PATH && window.matchMedia(MOBILE_MAX_WIDTH).matches) {
      resetPageScrollPosition(pathname);
      return;
    }

    restorePageScrollPosition(pathname);
  }
}
