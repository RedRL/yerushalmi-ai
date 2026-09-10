import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  computed,
  inject,
  signal,
} from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { FIELD_LIMITS } from '../../../../../core/config/field-limits.config';
import { containScrollWheel } from '../../../../../shared/utils/contain-scroll-wheel.util';
import {
  formatIsoDateToHeIl,
  isIsoDateBeforeToday,
  maskHeIlDateInput,
  parseHeIlDateToIso,
  todayIsoHeIl,
} from '../../../../../shared/utils/he-date.util';
import { ConfiguratorStoreService } from '../../../state/configurator-store.service';

const WEEKDAY_LABELS = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'] as const;
const MONTH_LABELS = [
  'ינואר',
  'פברואר',
  'מרץ',
  'אפריל',
  'מאי',
  'יוני',
  'יולי',
  'אוגוסט',
  'ספטמבר',
  'אוקטובר',
  'נובמבר',
  'דצמבר',
] as const;

@Component({
  selector: 'app-project-details-step',
  imports: [ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './project-details-step.component.html',
  styleUrl: './project-details-step.component.scss',
})
export class ProjectDetailsStepComponent {
  private readonly host = inject(ElementRef<HTMLElement>);
  readonly store = inject(ConfiguratorStoreService);
  readonly limits = FIELD_LIMITS;
  readonly weekdayLabels = WEEKDAY_LABELS;
  readonly eventDateText = signal(formatIsoDateToHeIl(this.store.projectDetailsForm.controls.eventDate.value));
  readonly calendarOpen = signal(false);
  readonly calendarMonth = signal(initialCalendarMonth(this.store.projectDetailsForm.controls.eventDate.value));

  readonly personNameLabel = computed(() =>
    this.store.includesVideo()
      ? 'שם האדם/האנשים שהקליפ עבורם *'
      : 'שם האדם/האנשים שהשיר עבורם *',
  );

  readonly calendarTitle = computed(() => {
    const month = this.calendarMonth();
    return `${MONTH_LABELS[month.getMonth()]} ${month.getFullYear()}`;
  });

  readonly selectedCalendarDay = computed(() => {
    const parsed = parseHeIlDateToIso(this.eventDateText());
    if (!parsed) return 0;
    const [year, month, day] = parsed.split('-').map(Number);
    const view = this.calendarMonth();
    if (year !== view.getFullYear() || month !== view.getMonth() + 1) return 0;
    return day ?? 0;
  });

  readonly canGoPrevMonth = computed(() => {
    const view = this.calendarMonth();
    const today = todayIsoHeIl();
    const [year, month] = today.split('-').map(Number);
    return view.getFullYear() > (year ?? 0) || view.getMonth() + 1 > (month ?? 0);
  });

  readonly calendarCells = computed(() => {
    const view = this.calendarMonth();
    const first = new Date(view.getFullYear(), view.getMonth(), 1);
    const daysInMonth = new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate();
    const leading = first.getDay();
    return [
      ...Array.from({ length: leading }, () => 0),
      ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
    ];
  });

  isPastCalendarDay(day: number): boolean {
    const view = this.calendarMonth();
    return isIsoDateBeforeToday(`${view.getFullYear()}-${pad2(view.getMonth() + 1)}-${pad2(day)}`);
  }

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

  toggleCalendar(): void {
    if (!this.calendarOpen()) {
      this.calendarMonth.set(initialCalendarMonth(this.store.projectDetailsForm.controls.eventDate.value));
    }
    this.calendarOpen.update((open) => !open);
  }

  shiftCalendarMonth(delta: number): void {
    if (delta < 0 && !this.canGoPrevMonth()) return;
    const current = this.calendarMonth();
    this.calendarMonth.set(new Date(current.getFullYear(), current.getMonth() + delta, 1));
  }

  selectToday(): void {
    const iso = todayIsoHeIl();
    const [year, month] = iso.split('-').map(Number);
    this.calendarMonth.set(new Date(year ?? new Date().getFullYear(), (month ?? 1) - 1, 1));
    this.store.projectDetailsForm.controls.eventDate.setValue(iso);
    this.eventDateText.set(formatIsoDateToHeIl(iso));
    this.store.projectDetailsForm.controls.eventDate.markAsTouched();
    this.calendarOpen.set(false);
  }

  selectCalendarDay(day: number): void {
    if (this.isPastCalendarDay(day)) return;
    const view = this.calendarMonth();
    const iso = `${view.getFullYear()}-${pad2(view.getMonth() + 1)}-${pad2(day)}`;
    this.store.projectDetailsForm.controls.eventDate.setValue(iso);
    this.eventDateText.set(formatIsoDateToHeIl(iso));
    this.store.projectDetailsForm.controls.eventDate.markAsTouched();
    this.calendarOpen.set(false);
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.calendarOpen.set(false);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.calendarOpen()) return;
    const target = event.target;
    if (target instanceof Node && this.host.nativeElement.contains(target)) {
      const element = target instanceof Element ? target : target.parentElement;
      if (element?.closest('.project-details-step__date-controls')) return;
    }
    this.calendarOpen.set(false);
  }

  onStoryWheel(event: WheelEvent): void {
    if (window.matchMedia('(max-width: 1023px)').matches) return;
    containScrollWheel(event, event.currentTarget as HTMLElement);
  }
}

function pad2(value: number): string {
  return String(value).padStart(2, '0');
}

function initialCalendarMonth(iso: string): Date {
  const parsed = parseHeIlDateToIso(iso);
  if (parsed) {
    const [year, month] = parsed.split('-').map(Number);
    return new Date(year ?? new Date().getFullYear(), (month ?? 1) - 1, 1);
  }
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}
