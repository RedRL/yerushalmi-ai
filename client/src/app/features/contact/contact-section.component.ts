import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { ContactApiService } from '../../core/services/contact-api.service';
import { WHATSAPP_CONFIG } from '../../core/config/site.config';
import { RevealOnScrollDirective } from '../../shared/directives/reveal-on-scroll.directive';
import { scrollToSection } from '../../shared/utils/scroll-to.util';

@Component({
  selector: 'app-contact-section',
  imports: [ReactiveFormsModule, RevealOnScrollDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './contact-section.component.html',
  styleUrl: './contact-section.component.scss',
})
export class ContactSectionComponent {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly contactApi = inject(ContactApiService);

  readonly whatsappUrl = WHATSAPP_CONFIG.url;
  readonly localPhone = WHATSAPP_CONFIG.localPhone;

  readonly isSubmitting = signal(false);
  readonly submitError = signal<string | null>(null);
  readonly submitSuccess = signal(false);

  readonly form = this.fb.group({
    name: this.fb.control('', Validators.required),
    phone: this.fb.control('', [Validators.required, Validators.pattern(/^[0-9+\-\s()]{7,20}$/)]),
    email: this.fb.control('', [Validators.required, Validators.email]),
    message: this.fb.control('', [Validators.required, Validators.minLength(5)]),
  });

  goToConfigurator(): void {
    scrollToSection('configurator');
  }

  async submit(): Promise<void> {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    this.isSubmitting.set(true);
    this.submitError.set(null);

    try {
      const value = this.form.getRawValue();
      await firstValueFrom(
        this.contactApi.submitMessage({
          name: value.name.trim(),
          phone: value.phone.trim(),
          email: value.email.trim(),
          message: value.message.trim(),
        }),
      );
      this.submitSuccess.set(true);
      this.form.reset({ name: '', phone: '', email: '', message: '' });
    } catch (error) {
      this.submitError.set(error instanceof Error ? error.message : 'שליחת ההודעה נכשלה. נסו שוב.');
    } finally {
      this.isSubmitting.set(false);
    }
  }
}
