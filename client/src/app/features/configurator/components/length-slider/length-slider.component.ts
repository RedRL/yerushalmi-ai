import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { localizedOptionLabel } from '../../../../core/config/pricing.config';
import { CurrencyService } from '../../../../core/i18n/currency.service';
import { LocaleService } from '../../../../core/i18n/locale.service';

export interface LengthChoice {
  id: string;
  labelHe: string;
  /** English label; the Hebrew label is used when missing. */
  labelEn?: string;
  price: number;
}

/** Leading approximation markers: Hebrew "כ-" and English "About " / "~". */
const APPROX_PREFIX = /^(?:כ-|about\s+|~\s*)/i;

@Component({
  selector: 'app-length-slider',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './length-slider.component.html',
  styleUrl: './length-slider.component.scss',
})
export class LengthSliderComponent {
  readonly i18n = inject(LocaleService);
  readonly money = inject(CurrencyService);

  readonly options = input.required<readonly LengthChoice[]>();
  readonly value = input('');
  readonly selected = output<string>();

  readonly tickMax = computed(() => Math.max(this.options().length - 1, 1));

  index(): number {
    const current = this.options().findIndex((option) => option.id === this.value());
    return current < 0 ? 0 : current;
  }

  current(): LengthChoice | undefined {
    return this.options()[this.index()];
  }

  /** Label of an option in the active locale. */
  label(option: LengthChoice | undefined): string {
    return option ? localizedOptionLabel(option, this.i18n.locale()) : '';
  }

  onInput(event: Event): void {
    const index = Number((event.target as HTMLInputElement).value);
    const option = this.options()[index];
    if (option) this.selected.emit(option.id);
  }

  /**
   * Split "כ-1.5 דקות" / "About 1.5 minutes" into number + unit for stacked mobile ticks.
   * The leading approximation marker ("כ-" / "About") is dropped.
   * English units are shortened (`min`) so end ticks stay inside the track.
   */
  tickParts(label: string): { value: string; unit: string } {
    const cleaned = label.replace(APPROX_PREFIX, '').trim();
    const match = /^([\d.]+)\s+(.+)$/.exec(cleaned);
    if (!match) return { value: cleaned, unit: '' };
    const rawUnit = match[2] ?? '';
    const unit = /minute/i.test(rawUnit) ? 'min' : rawUnit;
    return { value: match[1] ?? cleaned, unit };
  }
}
