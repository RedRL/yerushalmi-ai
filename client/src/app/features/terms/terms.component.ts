import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  DOCUMENT,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { filter } from 'rxjs';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { CONTACT_EMAIL_CONFIG, SITE_CONFIG } from '../../core/config/site.config';
import { LocaleService } from '../../core/i18n/locale.service';
import type { L10nText } from '../../core/i18n/locale.types';
import { EmailComposeDirective } from '../../shared/directives/email-compose.directive';
import { resetPageScrollPosition } from '../../shared/utils/scroll-restoration.util';
import { TERMS_CONTENT, fillTerms, parseStrong } from './terms.content';

/** A renderable chunk of a terms paragraph/bullet. */
interface TermsSegment {
  kind: 'text' | 'strong' | 'email';
  text: string;
}

interface TermsSectionView {
  title: string;
  paragraphs: TermsSegment[][];
  bullets: TermsSegment[][];
}

const EMAIL_TOKEN = /(\{email\})/g;

@Component({
  selector: 'app-terms',
  imports: [RouterLink, NgTemplateOutlet, HeaderComponent, FooterComponent, EmailComposeDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './terms.component.html',
  styleUrl: './terms.component.scss',
  host: {
    '[class.terms-page--weddings]': 'isWeddings()',
  },
})
export class TermsComponent {
  private readonly router = inject(Router);
  private readonly document = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);
  readonly i18n = inject(LocaleService);

  readonly content = TERMS_CONTENT;
  readonly brandName = SITE_CONFIG.brandName;
  readonly contactEmail = CONTACT_EMAIL_CONFIG.address;
  readonly contactMailto = CONTACT_EMAIL_CONFIG.mailtoUrl;

  private readonly path = signal(this.currentPath());
  readonly isWeddings = computed(() => this.path().startsWith('/weddings'));
  readonly homePath = computed(() => (this.isWeddings() ? '/weddings' : '/clips'));

  readonly intro = computed(() => this.segments(this.content.intro));

  readonly sections = computed<readonly TermsSectionView[]>(() =>
    this.content.sections.map((section) => ({
      title: fillTerms(this.i18n.tx(section.title), { brand: this.brandName }),
      paragraphs: (section.paragraphs ?? []).map((paragraph) => this.segments(paragraph)),
      bullets: (section.bullets ?? []).map((bullet) => this.segments(bullet)),
    })),
  );

  constructor() {
    this.syncWeddingsTheme(this.isWeddings());

    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => {
        this.path.set(this.currentPath());
        this.syncWeddingsTheme(this.isWeddings());
      });

    this.destroyRef.onDestroy(() => {
      this.document.documentElement.classList.remove('weddings-theme');
    });
  }

  goHome(event: Event): void {
    if (!window.matchMedia('(max-width: 1023px)').matches) return;

    event.preventDefault();
    const home = this.homePath();
    resetPageScrollPosition(home);
    void this.router.navigateByUrl(home);
  }

  private currentPath(): string {
    return this.router.url.split('?')[0].split('#')[0];
  }

  private syncWeddingsTheme(enabled: boolean): void {
    this.document.documentElement.classList.toggle('weddings-theme', enabled);
  }

  /**
   * Resolves a bilingual string for the active locale, fills `{brand}`, and splits it into
   * plain / bold / email segments (`{email}` is rendered as a mailto link by the template).
   */
  private segments(value: L10nText): TermsSegment[] {
    const filled = fillTerms(this.i18n.tx(value), { brand: this.brandName });

    return filled
      .split(EMAIL_TOKEN)
      .filter((part) => part.length > 0)
      .flatMap((part): TermsSegment[] =>
        part === '{email}'
          ? [{ kind: 'email', text: this.contactEmail }]
          : parseStrong(part).map((segment): TermsSegment => ({
              kind: segment.strong ? 'strong' : 'text',
              text: segment.text,
            })),
      );
  }
}
