import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
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
})
export class TermsComponent {
  private readonly router = inject(Router);
  readonly i18n = inject(LocaleService);

  readonly content = TERMS_CONTENT;
  readonly brandName = SITE_CONFIG.brandName;
  readonly contactEmail = CONTACT_EMAIL_CONFIG.address;
  readonly contactMailto = CONTACT_EMAIL_CONFIG.mailtoUrl;

  readonly intro = computed(() => this.segments(this.content.intro));

  readonly sections = computed<readonly TermsSectionView[]>(() =>
    this.content.sections.map((section) => ({
      title: fillTerms(this.i18n.tx(section.title), { brand: this.brandName }),
      paragraphs: (section.paragraphs ?? []).map((paragraph) => this.segments(paragraph)),
      bullets: (section.bullets ?? []).map((bullet) => this.segments(bullet)),
    })),
  );

  goHome(event: Event): void {
    if (!window.matchMedia('(max-width: 1023px)').matches) return;

    event.preventDefault();
    resetPageScrollPosition('/clips');
    void this.router.navigateByUrl('/clips');
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
