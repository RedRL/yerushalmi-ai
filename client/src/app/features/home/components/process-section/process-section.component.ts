import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { LocaleService } from '../../../../core/i18n/locale.service';
import { SectionHeadingComponent } from '../../../../shared/components/section-heading/section-heading.component';
import { RevealOnScrollDirective } from '../../../../shared/directives/reveal-on-scroll.directive';
import { HOME_MESSAGES } from '../../home.messages';

/** Localized process step, resolved for the active locale. */
interface ProcessStepView {
  step: number;
  title: string;
  description: string;
}

@Component({
  selector: 'app-process-section',
  imports: [SectionHeadingComponent, RevealOnScrollDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './process-section.component.html',
  styleUrl: './process-section.component.scss',
})
export class ProcessSectionComponent {
  readonly i18n = inject(LocaleService);
  readonly msg = HOME_MESSAGES.process;

  readonly steps = computed<readonly ProcessStepView[]>(() =>
    this.msg.steps.map((item) => ({
      step: item.step,
      title: this.i18n.tx(item.title),
      description: this.i18n.tx(item.description),
    })),
  );
}
