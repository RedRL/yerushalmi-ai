import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { FIELD_LIMITS } from '../../../../../core/config/field-limits.config';
import { WHATSAPP_CONFIG } from '../../../../../core/config/site.config';
import { formatShortInquiryReference } from '../../../../../shared/utils/inquiry-reference.util';
import { ConfiguratorStoreService } from '../../../state/configurator-store.service';

@Component({
  selector: 'app-contact-step',
  imports: [ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './contact-step.component.html',
  styleUrl: './contact-step.component.scss',
})
export class ContactStepComponent {
  readonly store = inject(ConfiguratorStoreService);
  readonly whatsappUrl = WHATSAPP_CONFIG.url;
  readonly limits = FIELD_LIMITS;
  readonly formatShortInquiryReference = formatShortInquiryReference;

  submit(): void {
    if (this.store.isSubmitting() || this.store.submitResult()) return;
    if (!this.store.isContactStepValid()) {
      this.store.contactForm.markAllAsTouched();
      return;
    }
    void this.store.submit();
  }

  startNewProject(): void {
    this.store.reset();
  }
}
