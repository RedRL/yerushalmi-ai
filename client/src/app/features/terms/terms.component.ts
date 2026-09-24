import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { CONTACT_EMAIL_CONFIG, SITE_CONFIG } from '../../core/config/site.config';
import { resetPageScrollPosition } from '../../shared/utils/scroll-restoration.util';

@Component({
  selector: 'app-terms',
  imports: [RouterLink, HeaderComponent, FooterComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './terms.component.html',
  styleUrl: './terms.component.scss',
})
export class TermsComponent {
  private readonly router = inject(Router);

  readonly brandName = SITE_CONFIG.brandName;
  readonly contactEmail = CONTACT_EMAIL_CONFIG.address;
  readonly contactMailto = CONTACT_EMAIL_CONFIG.mailtoUrl;
  readonly lastUpdated = 'ספטמבר 2026';

  goHome(event: Event): void {
    if (!window.matchMedia('(max-width: 1023px)').matches) return;

    event.preventDefault();
    resetPageScrollPosition('/clips');
    void this.router.navigateByUrl('/clips');
  }
}
