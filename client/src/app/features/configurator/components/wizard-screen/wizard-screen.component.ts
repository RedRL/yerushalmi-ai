import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

@Component({
  selector: 'app-wizard-screen',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './wizard-screen.component.html',
  styleUrl: './wizard-screen.component.scss',
})
export class WizardScreenComponent {
  readonly kicker = input('');
  readonly heading = input.required<string>();
  readonly description = input('');
  readonly index = input(0);
  readonly total = input(1);
  readonly skippable = input(false);
  readonly canContinue = input(true);
  readonly showActions = input(true);
  readonly continueLabel = input('המשך');

  readonly continued = output<void>();
  readonly skipped = output<void>();

  readonly dots = computed(() => Array.from({ length: this.total() }, (_, dot) => dot));
}
