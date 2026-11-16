import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CONTACT_EMAIL_CONFIG, SITE_CONFIG, WHATSAPP_CONFIG } from '../../../core/config/site.config';
import { LocaleService } from '../../../core/i18n/locale.service';
import { EmailComposeDirective } from '../../directives/email-compose.directive';
import { resetPageScrollPosition } from '../../utils/scroll-restoration.util';

@Component({
  selector: 'app-footer',
  imports: [RouterLink, EmailComposeDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss',
})
export class FooterComponent {
  private readonly router = inject(Router);
  readonly i18n = inject(LocaleService);

  readonly brandName = SITE_CONFIG.brandName;
  readonly contactEmail = CONTACT_EMAIL_CONFIG.address;
  readonly contactEmailUrl = CONTACT_EMAIL_CONFIG.mailtoUrl;
  readonly currentYear = new Date().getFullYear();

  readonly tagline = computed(() => this.i18n.t('site.tagline'));
  readonly whatsappUrl = computed(() =>
    WHATSAPP_CONFIG.buildUrl(this.i18n.t('site.whatsappDefaultMessage')),
  );

  onTermsClick(event: Event): void {
    if (this.router.url.split('?')[0].split('#')[0] !== '/clips/terms') return;

    event.preventDefault();
    resetPageScrollPosition('/clips/terms');
  }
}
