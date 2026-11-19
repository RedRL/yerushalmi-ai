import { NgTemplateOutlet } from '@angular/common';
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
import { OCCASION_OPTIONS } from '../../../../../core/config/occasion.config';
import { SITE_CONFIG } from '../../../../../core/config/site.config';
import { LocaleService } from '../../../../../core/i18n/locale.service';
import type { UiMessageKey } from '../../../../../core/i18n/messages';
import { l10n, type L10nText } from '../../../../../core/i18n/locale.types';
import { containScrollWheel } from '../../../../../shared/utils/contain-scroll-wheel.util';
import {
  formatIsoDateToHeIl,
  isIsoDateBeforeToday,
  maskHeIlDateInput,
  parseHeIlDateToIso,
  todayIsoHeIl,
} from '../../../../../shared/utils/he-date.util';
import { ConfiguratorStoreService } from '../../../state/configurator-store.service';
import type {
  WeddingMustInclude,
  WeddingPreparer,
  WeddingVibe,
} from '../../../state/wedding-details.util';
import { WizardScreenComponent } from '../../wizard-screen/wizard-screen.component';

/** Sunday-first, matching `Date#getDay()`. */
const WEEKDAY_LABELS: readonly L10nText[] = [
  l10n('א', 'S'),
  l10n('ב', 'M'),
  l10n('ג', 'T'),
  l10n('ד', 'W'),
  l10n('ה', 'T'),
  l10n('ו', 'F'),
  l10n('ש', 'S'),
];
const MONTH_LABELS: readonly L10nText[] = [
  l10n('ינואר', 'January'),
  l10n('פברואר', 'February'),
  l10n('מרץ', 'March'),
  l10n('אפריל', 'April'),
  l10n('מאי', 'May'),
  l10n('יוני', 'June'),
  l10n('יולי', 'July'),
  l10n('אוגוסט', 'August'),
  l10n('ספטמבר', 'September'),
  l10n('אוקטובר', 'October'),
  l10n('נובמבר', 'November'),
  l10n('דצמבר', 'December'),
];

@Component({
  selector: 'app-project-details-step',
  imports: [NgTemplateOutlet, ReactiveFormsModule, WizardScreenComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './project-details-step.component.html',
  styleUrl: './project-details-step.component.scss',
})
export class ProjectDetailsStepComponent {
  private readonly destroyRef = inject(DestroyRef);
  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly nativeDate = viewChild<ElementRef<HTMLInputElement>>('nativeDate');
  private readonly customOccasionInput = viewChild<ElementRef<HTMLInputElement>>('customOccasionInput');
  readonly store = inject(ConfiguratorStoreService);
  readonly i18n = inject(LocaleService);
  readonly limits = FIELD_LIMITS;
  readonly occasionOptions = OCCASION_OPTIONS;
  readonly weddingsUrl = SITE_CONFIG.weddingsUrl;
  readonly weekdayLabels = computed(() => WEEKDAY_LABELS.map((label) => this.i18n.tx(label)));
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
    this.i18n.t(
      this.store.includesVideo() ? 'details.personName.headingVideo' : 'details.personName.headingSong',
    ),
  );

  readonly preparerOptions: ReadonlyArray<{ id: WeddingPreparer; labelKey: UiMessageKey }> = [
    { id: 'couple', labelKey: 'details.wedding.whoPrepares.couple' },
    { id: 'friends', labelKey: 'details.wedding.whoPrepares.friends' },
    { id: 'family', labelKey: 'details.wedding.whoPrepares.family' },
  ];

  readonly vibeOptions: ReadonlyArray<{ id: WeddingVibe; labelKey: UiMessageKey }> = [
    { id: 'funny_upbeat', labelKey: 'details.wedding.vibe.funny_upbeat' },
    { id: 'emotional_romantic', labelKey: 'details.wedding.vibe.emotional_romantic' },
    { id: 'party', labelKey: 'details.wedding.vibe.party' },
    { id: 'mix', labelKey: 'details.wedding.vibe.mix' },
    { id: 'other', labelKey: 'details.wedding.vibe.other' },
  ];

  readonly mustIncludeOptions: ReadonlyArray<{ id: WeddingMustInclude; labelKey: UiMessageKey }> = [
    { id: 'proposal', labelKey: 'details.wedding.mustInclude.proposal' },
    { id: 'funny_moment', labelKey: 'details.wedding.mustInclude.funny_moment' },
    { id: 'both', labelKey: 'details.wedding.mustInclude.both' },
  ];

  readonly isThirdPerson = computed(() => {
    this.store.isCurrentStepValid();
    const value = this.store.weddingForm.controls.whoPrepares.value;
    return value === 'friends' || value === 'family';
  });

  readonly partner1AboutLabel = computed(() => {
    this.store.isCurrentStepValid();
    const name = this.store.weddingForm.controls.partner1Name.value.trim();
    return this.i18n.tf('details.wedding.partnerAbout.about', {
      name: name || this.i18n.t('details.wedding.partnerAbout.fallback1'),
    });
  });

  readonly partner2AboutLabel = computed(() => {
    this.store.isCurrentStepValid();
    const name = this.store.weddingForm.controls.partner2Name.value.trim();
    return this.i18n.tf('details.wedding.partnerAbout.about', {
      name: name || this.i18n.t('details.wedding.partnerAbout.fallback2'),
    });
  });

  weddingMsg(base: UiMessageKey): string {
    if (!this.isThirdPerson()) return this.i18n.t(base);
    const theyKey = `${base}.they` as UiMessageKey;
    return this.i18n.t(theyKey);
  }

  needsPreparerRelation(): boolean {
    const value = this.store.weddingForm.controls.whoPrepares.value;
    return value === 'friends' || value === 'family';
  }

  showCustomVibe(): boolean {
    return this.store.weddingForm.controls.vibe.value === 'other';
  }

  showProposalStory(): boolean {
    const value = this.store.weddingForm.controls.mustInclude.value;
    return value === 'proposal' || value === 'both';
  }

  showMemorableMoment(): boolean {
    const value = this.store.weddingForm.controls.mustInclude.value;
    return value === 'funny_moment' || value === 'both';
  }

  selectPreparer(id: WeddingPreparer): void {
    this.store.weddingForm.controls.whoPrepares.setValue(id);
    if (id === 'couple') {
      this.store.weddingForm.controls.preparerRelation.setValue('');
    }
  }

  selectVibe(id: WeddingVibe): void {
    this.store.weddingForm.controls.vibe.setValue(id);
    if (id !== 'other') {
      this.store.weddingForm.controls.customVibe.setValue('');
    }
  }

  selectMustInclude(id: WeddingMustInclude): void {
    this.store.weddingForm.controls.mustInclude.setValue(id);
    if (id === 'funny_moment') {
      this.store.weddingForm.controls.proposalStory.setValue('');
    }
    if (id === 'proposal') {
      this.store.weddingForm.controls.memorableMoment.setValue('');
    }
  }

  onOccasionChange(): void {
    if (this.store.projectDetailsForm.controls.occasionId.value !== 'other') {
      this.store.projectDetailsForm.controls.customOccasion.setValue('');
    }
    if (this.store.isCustomOccasion()) {
      setTimeout(() => this.scrollCustomOccasionIntoView());
    }
  }

  private scrollCustomOccasionIntoView(): void {
    const input = this.customOccasionInput()?.nativeElement;
    if (!input) return;
    const scroller = input.closest('.configurator__body');
    if (!(scroller instanceof HTMLElement)) {
      input.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      return;
    }

    const inputRect = input.getBoundingClientRect();
    const scrollerRect = scroller.getBoundingClientRect();
    const padding = 12;
    if (inputRect.top >= scrollerRect.top + padding && inputRect.bottom <= scrollerRect.bottom - padding) {
      return;
    }

    const delta =
      inputRect.bottom > scrollerRect.bottom - padding
        ? inputRect.bottom - (scrollerRect.bottom - padding)
        : inputRect.top - (scrollerRect.top + padding);
    scroller.scrollTo({ top: scroller.scrollTop + delta, behavior: 'smooth' });
  }

  readonly calendarTitle = computed(() => {
    const month = this.calendarMonth();
    return `${this.i18n.tx(MONTH_LABELS[month.getMonth()])} ${month.getFullYear()}`;
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
    if (control.hasError('pastDate')) return this.i18n.t('validation.eventDatePast');
    if (control.hasError('invalidDate')) return this.i18n.t('validation.eventDateInvalid');
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

  screenIndex(): number {
    return this.store.subStepPosition();
  }

  screenTotal(): number {
    return this.store.currentScreens().length;
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
