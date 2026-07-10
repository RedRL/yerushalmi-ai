import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { SONG_STYLE_OPTIONS } from '../../../../../core/config/pricing.config';
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

  selectStyle(style: string): void {
    this.store.songForm.controls.style.setValue(style);
    if (style !== 'אחר') {
      this.store.songForm.controls.customStyle.setValue('');
    }
  }
}
