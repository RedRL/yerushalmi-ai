import { ChangeDetectionStrategy, Component, computed, ElementRef, inject, signal, viewChild } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { FIELD_LIMITS } from '../../../../../core/config/field-limits.config';
import { containScrollWheel } from '../../../../../shared/utils/contain-scroll-wheel.util';
import { formatIsoDateToHeIl, maskHeIlDateInput, parseHeIlDateToIso } from '../../../../../shared/utils/he-date.util';
import { ConfiguratorStoreService } from '../../../state/configurator-store.service';

@Component({
  selector: 'app-project-details-step',
  imports: [ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './project-details-step.component.html',
  styleUrl: './project-details-step.component.scss',
})
export class ProjectDetailsStepComponent {
  readonly store = inject(ConfiguratorStoreService);
  readonly limits = FIELD_LIMITS;
  readonly eventDateText = signal(formatIsoDateToHeIl(this.store.projectDetailsForm.controls.eventDate.value));
  readonly nativeDatePicker = viewChild<ElementRef<HTMLInputElement>>('nativeDatePicker');

  readonly personNameLabel = computed(() =>
    this.store.includesVideo()
      ? 'שם האדם/האנשים שהקליפ עבורם *'
      : 'שם האדם/האנשים שהשיר עבורם *',
  );

  readonly eventDateIso = computed(() => {
    const parsed = parseHeIlDateToIso(this.eventDateText());
    return parsed || '';
  });

  onEventDateInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const masked = maskHeIlDateInput(input.value);
    input.value = masked;
    this.eventDateText.set(masked);
    const parsed = parseHeIlDateToIso(masked);
    if (parsed === '') {
      this.store.projectDetailsForm.controls.eventDate.setValue('');
      return;
    }
    if (parsed) {
      this.store.projectDetailsForm.controls.eventDate.setValue(parsed);
    }
  }

  onEventDateBlur(): void {
    const control = this.store.projectDetailsForm.controls.eventDate;
    const parsed = parseHeIlDateToIso(this.eventDateText());
    if (parsed === null) {
      control.setValue(this.eventDateText().trim());
      control.markAsTouched();
      return;
    }
    control.setValue(parsed);
    this.eventDateText.set(parsed ? formatIsoDateToHeIl(parsed) : '');
    control.markAsTouched();
  }

  onDatePickerChange(event: Event): void {
    const iso = (event.target as HTMLInputElement).value;
    this.store.projectDetailsForm.controls.eventDate.setValue(iso);
    this.eventDateText.set(formatIsoDateToHeIl(iso));
    this.store.projectDetailsForm.controls.eventDate.markAsTouched();
  }

  openDatePicker(): void {
    const input = this.nativeDatePicker()?.nativeElement;
    if (!input) return;
    if (typeof input.showPicker === 'function') {
      input.showPicker();
      return;
    }
    input.click();
  }

  onStoryWheel(event: WheelEvent): void {
    if (window.matchMedia('(max-width: 1023px)').matches) return;
    containScrollWheel(event, event.currentTarget as HTMLElement);
  }
}
