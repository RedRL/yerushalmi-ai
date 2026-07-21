import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { FIELD_LIMITS } from '../../../../../core/config/field-limits.config';
import { getSongLengthOptions, SONG_STYLE_OPTIONS } from '../../../../../core/config/pricing.config';
import type { SongLengthId } from '../../../../../shared/models/pricing.model';
import { ConfiguratorStoreService } from '../../../state/configurator-store.service';

@Component({
  selector: 'app-song-step',
  imports: [ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './song-step.component.html',
  styleUrl: './song-step.component.scss',
})
export class SongStepComponent {
  readonly store = inject(ConfiguratorStoreService);
  readonly styleOptions = SONG_STYLE_OPTIONS;
  readonly limits = FIELD_LIMITS;

  readonly lengthOptions = computed(() => getSongLengthOptions(this.store.mainProduct()));

  readonly lengthFieldLabel = computed(() =>
    this.store.isFullExperience() ? 'אורך משוער (שיר וסרטון)' : 'אורך משוער',
  );

  lengthOptionLabel(option: { id: SongLengthId; labelHe: string; price: number }): string {
    if (option.price === 0) {
      return option.labelHe;
    }
    return `${option.labelHe} (+₪${option.price})`;
  }
}
