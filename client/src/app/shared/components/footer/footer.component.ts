import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CONTACT_EMAIL_CONFIG, SITE_CONFIG, WHATSAPP_CONFIG } from '../../../core/config/site.config';
import { resetPageScrollPosition } from '../../utils/scroll-restoration.util';

@Component({
  selector: 'app-footer',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss',
})
export class FooterComponent {
  private readonly router = inject(Router);

  readonly brandName = SITE_CONFIG.brandName;
  readonly taglineHe = SITE_CONFIG.taglineHe;
  readonly contactEmail = CONTACT_EMAIL_CONFIG.address;
  readonly contactEmailUrl = CONTACT_EMAIL_CONFIG.mailtoUrl;
  readonly whatsappUrl = WHATSAPP_CONFIG.url;
  readonly currentYear = new Date().getFullYear();

  onTermsClick(event: Event): void {
    if (this.router.url.split('?')[0] !== '/terms') return;

    event.preventDefault();
    resetPageScrollPosition('/terms');
  }
}
