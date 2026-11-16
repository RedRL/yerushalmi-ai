import { Injectable, computed, effect, signal } from '@angular/core';

export type CurrencyCode = 'ILS' | 'USD';

const STORAGE_KEY = 'yerushalmi.currency';

/**
 * Mid-market is ~3.25. Divide by 3.24 so display USD is only a touch dearer
 * than shekels (ceil handles the rest) — not a large markup.
 */
const USD_ILS_RATE = 3.24;

function ilsToUsd(amountIls: number): number {
  if (amountIls <= 0) return 0;
  return Math.ceil(amountIls / USD_ILS_RATE - 1e-9);
}

function readStoredCurrency(): CurrencyCode {
  if (typeof localStorage === 'undefined') return 'ILS';
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw === 'USD' || raw === 'ILS' ? raw : 'ILS';
  } catch {
    return 'ILS';
  }
}

@Injectable({ providedIn: 'root' })
export class CurrencyService {
  readonly currency = signal<CurrencyCode>(readStoredCurrency());
  readonly isIls = computed(() => this.currency() === 'ILS');
  readonly isUsd = computed(() => this.currency() === 'USD');
  readonly symbol = computed(() => (this.currency() === 'USD' ? '$' : '₪'));

  /** Label shown on the toggle — the *other* currency. */
  readonly switchLabel = computed(() => (this.currency() === 'ILS' ? 'USD' : 'ILS'));

  constructor() {
    effect(() => {
      const currency = this.currency();
      if (typeof document !== 'undefined') {
        document.documentElement.dataset['currency'] = currency;
      }
      try {
        localStorage.setItem(STORAGE_KEY, currency);
      } catch {
        // Ignore private-mode / quota errors.
      }
    });
  }

  setCurrency(currency: CurrencyCode): void {
    if (this.currency() === currency) return;
    this.currency.set(currency);
  }

  toggleCurrency(): void {
    this.setCurrency(this.currency() === 'ILS' ? 'USD' : 'ILS');
  }

  /** Convert an ILS catalog amount into the active display currency. */
  fromIls(amountIls: number): number {
    const rounded = Math.round(amountIls);
    if (this.currency() === 'ILS') return rounded;
    return ilsToUsd(rounded);
  }

  /** Format an ILS catalog amount for the active currency (`₪200` / `$62`). */
  format(amountIls: number): string {
    return `${this.symbol()}${this.fromIls(amountIls)}`;
  }

  /** Format a negative discount line (`-₪40` / `-$13`). */
  formatDiscount(amountIls: number): string {
    const value = this.fromIls(Math.abs(amountIls));
    return `-${this.symbol()}${value}`;
  }
}
