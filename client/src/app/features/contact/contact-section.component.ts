import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SectionHeadingComponent } from '../../shared/components/section-heading/section-heading.component';
import { WHATSAPP_CONFIG } from '../../core/config/site.config';
import { scrollToSection } from '../../shared/utils/scroll-to.util';

@Component({
  selector: 'app-contact-section',
  imports: [SectionHeadingComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './contact-section.component.html',
  styleUrl: './contact-section.component.scss',
})
export class ContactSectionComponent {
  readonly whatsappUrl = WHATSAPP_CONFIG.url;
  readonly localPhone = WHATSAPP_CONFIG.localPhone;

  goToConfigurator(): void {
    scrollToSection('configurator');
  }
}
