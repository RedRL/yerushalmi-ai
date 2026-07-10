import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NAV_LINKS, SITE_CONFIG, WHATSAPP_CONFIG } from '../../../core/config/site.config';
import { scrollToSection } from '../../utils/scroll-to.util';

@Component({
  selector: 'app-footer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss',
})
export class FooterComponent {
  readonly brandName = SITE_CONFIG.brandName;
  readonly taglineHe = SITE_CONFIG.taglineHe;
  readonly navLinks = NAV_LINKS;
  readonly whatsappUrl = WHATSAPP_CONFIG.url;
  readonly localPhone = WHATSAPP_CONFIG.localPhone;
  readonly currentYear = new Date().getFullYear();

  navigateTo(sectionId: string): void {
    scrollToSection(sectionId);
  }
}
