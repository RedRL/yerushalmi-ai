import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  HostListener,
  computed,
  effect,
  inject,
  signal,
  viewChild,
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
  private readonly destroyRef = inject(DestroyRef);
  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly nativeDate = viewChild<ElementRef<HTMLInputElement>>('nativeDate');
  readonly store = inject(ConfiguratorStoreService);
  readonly limits = FIELD_LIMITS;
  readonly weekdayLabels = WEEKDAY_LABELS;
  readonly isMobileViewport = signal(false);
  readonly dateFieldTouched = signal(this.store.projectDetailsForm.controls.eventDate.touched);
  readonly eventDateText = signal(formatIsoDateToHeIl(this.store.projectDetailsForm.controls.eventDate.value));
  readonly calendarOpen = signal(false);
  readonly calendarMonth = signal(initialCalendarMonth(this.store.projectDetailsForm.controls.eventDate.value));

  constructor() {
    const media = window.matchMedia('(max-width: 1023px)');
    const syncMobile = (): void => {
      this.isMobileViewport.set(media.matches);
      if (media.matches) this.calendarOpen.set(false);
    };
    syncMobile();
    media.addEventListener('change', syncMobile);
    this.destroyRef.onDestroy(() => media.removeEventListener('change', syncMobile));

    effect(() => {
      this.store.isCurrentStepValid();
      this.store.currentStepValidationMessage();
      if (this.store.projectDetailsForm.controls.eventDate.touched) {
        this.dateFieldTouched.set(true);
      }
    });
  }

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

  readonly todayCalendarDay = computed(() => {
    const [year, month, day] = todayIsoHeIl().split('-').map(Number);
    const view = this.calendarMonth();
    if (year !== view.getFullYear() || month !== view.getMonth() + 1) return 0;
    return day ?? 0;
  });

  readonly minEventDate = todayIsoHeIl;

  readonly nativeDateValue = computed(() => {
    const parsed = parseHeIlDateToIso(this.eventDateText());
    return parsed || '';
  });

  readonly eventDateError = computed(() => {
    this.eventDateText();
    this.dateFieldTouched();
    const control = this.store.projectDetailsForm.controls.eventDate;
    if (!control.touched && !this.dateFieldTouched()) return null;
    if (control.hasError('pastDate')) return 'תאריך האירוע לא יכול להיות לפני היום';
    if (control.hasError('invalidDate')) return 'נא להזין תאריך תקין';
    return null;
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
    this.syncTypedDate(masked);
  }

  onEventDateBlur(): void {
    const parsed = parseHeIlDateToIso(this.eventDateText());
    if (parsed) {
      this.eventDateText.set(formatIsoDateToHeIl(parsed));
    }
    this.markDateTouched();
  }

  onNativeEventDateInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    const control = this.store.projectDetailsForm.controls.eventDate;
    control.setValue(value);
    this.eventDateText.set(formatIsoDateToHeIl(value));
    this.markDateTouched();
  }

  toggleCalendar(): void {
    if (this.isMobileViewport()) {
      this.openNativePicker();
      return;
    }
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

  revealToday(): void {
    const [year, month] = todayIsoHeIl().split('-').map(Number);
    this.calendarMonth.set(new Date(year ?? new Date().getFullYear(), (month ?? 1) - 1, 1));
  }

  selectCalendarDay(day: number): void {
    if (this.isPastCalendarDay(day)) return;
    const view = this.calendarMonth();
    const iso = `${view.getFullYear()}-${pad2(view.getMonth() + 1)}-${pad2(day)}`;
    this.store.projectDetailsForm.controls.eventDate.setValue(iso);
    this.eventDateText.set(formatIsoDateToHeIl(iso));
    this.markDateTouched();
    this.calendarOpen.set(false);
  }

  private syncTypedDate(masked: string): void {
    this.eventDateText.set(masked);
    const control = this.store.projectDetailsForm.controls.eventDate;
    const parsed = parseHeIlDateToIso(masked);
    if (parsed === '') {
      control.setValue('');
      return;
    }
    control.setValue(parsed ?? masked);
  }

  private markDateTouched(): void {
    this.store.projectDetailsForm.controls.eventDate.markAsTouched();
    this.dateFieldTouched.set(true);
  }

  private openNativePicker(): void {
    const input = this.nativeDate()?.nativeElement;
    if (!input) return;
    try {
      if (typeof input.showPicker === 'function') {
        input.showPicker();
        return;
      }
    } catch {
      // Some browsers reject showPicker(); fall through to a direct click.
    }
    input.focus();
    input.click();
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
    const element = event.currentTarget as HTMLElement;
    if (element.scrollHeight <= element.clientHeight) return;
    containScrollWheel(event, element);
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
