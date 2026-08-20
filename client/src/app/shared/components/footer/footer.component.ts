import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CONTACT_EMAIL_CONFIG, SITE_CONFIG } from '../../../core/config/site.config';

@Component({
  selector: 'app-footer',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss',
})
export class FooterComponent {
  readonly brandName = SITE_CONFIG.brandName;
  readonly taglineHe = SITE_CONFIG.taglineHe;
  readonly contactEmail = CONTACT_EMAIL_CONFIG.address;
  readonly contactEmailUrl = CONTACT_EMAIL_CONFIG.mailtoUrl;
  readonly currentYear = new Date().getFullYear();
}
