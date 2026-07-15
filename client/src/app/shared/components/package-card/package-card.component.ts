import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import type { PackageDefinition } from '../../../core/config/packages.config';

@Component({
  selector: 'app-package-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './package-card.component.html',
  styleUrl: './package-card.component.scss',
})
export class PackageCardComponent {
  readonly pkg = input.required<PackageDefinition>();
  readonly selected = input(false);
  readonly selectable = input(true);
  readonly animateDelay = input(0);

  readonly select = output<void>();
}
