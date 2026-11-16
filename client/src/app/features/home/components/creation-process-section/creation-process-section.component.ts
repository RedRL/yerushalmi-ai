import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { LocaleService } from '../../../../core/i18n/locale.service';
import { SectionHeadingComponent } from '../../../../shared/components/section-heading/section-heading.component';
import { RevealOnScrollDirective } from '../../../../shared/directives/reveal-on-scroll.directive';
import { HOME_MESSAGES, type HomeCreationMethod } from '../../home.messages';

export type CreationMethod = HomeCreationMethod;

/** Localized creation stage, resolved for the active locale. */
export interface CreationStage {
  step: number;
  title: string;
  description: string;
  method: CreationMethod;
  methodLabel: string;
}

@Component({
  selector: 'app-creation-process-section',
  imports: [SectionHeadingComponent, RevealOnScrollDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './creation-process-section.component.html',
  styleUrl: './creation-process-section.component.scss',
})
export class CreationProcessSectionComponent {
  readonly i18n = inject(LocaleService);
  readonly msg = HOME_MESSAGES.creation;

  readonly stages = computed<readonly CreationStage[]>(() =>
    this.msg.stages.map((stage) => ({
      step: stage.step,
      title: this.i18n.tx(stage.title),
      description: this.i18n.tx(stage.description),
      method: stage.method,
      methodLabel: this.i18n.tx(stage.methodLabel),
    })),
  );
}
