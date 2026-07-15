import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { SONG_LENGTH_OPTIONS, SONG_STYLE_OPTIONS } from '../../../../../core/config/pricing.config';
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
  readonly lengthOptions = SONG_LENGTH_OPTIONS;
}
