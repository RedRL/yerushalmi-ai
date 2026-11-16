import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import type { PackageDefinition } from '../../../core/config/packages.config';
import { CurrencyService } from '../../../core/i18n/currency.service';
import { LocaleService } from '../../../core/i18n/locale.service';

@Component({
  selector: 'app-package-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './package-card.component.html',
  styleUrl: './package-card.component.scss',
})
export class PackageCardComponent {
  readonly i18n = inject(LocaleService);
  readonly money = inject(CurrencyService);

  readonly pkg = input.required<PackageDefinition>();
  readonly selected = input(false);
  readonly selectable = input(true);
  readonly animateDelay = input(0);

  readonly select = output<void>();
}
