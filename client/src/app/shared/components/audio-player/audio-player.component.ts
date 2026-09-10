import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';

@Component({
  selector: 'app-audio-player',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './audio-player.component.html',
  styleUrl: './audio-player.component.scss',
})
export class AudioPlayerComponent {
  readonly src = input.required<string>();
  readonly label = input<string>('נגן שמע');
  readonly autoplay = input(false);

  readonly playingChange = output<boolean>();

  private readonly audioRef = viewChild<ElementRef<HTMLAudioElement>>('audio');

  readonly currentTime = signal(0);
  readonly duration = signal(0);
  readonly playing = signal(false);

  readonly progress = computed(() => {
    const total = this.duration();
    return total > 0 ? (this.currentTime() / total) * 100 : 0;
  });

  readonly currentLabel = computed(() => formatTime(this.currentTime()));
  readonly durationLabel = computed(() => formatTime(this.duration()));

  toggle(): void {
    const audio = this.audioRef()?.nativeElement;
    if (!audio) return;

    if (audio.paused) {
      void audio.play();
    } else {
      audio.pause();
    }
  }

  onLoadedMetadata(event: Event): void {
    const audio = event.target as HTMLAudioElement;
    this.duration.set(Number.isFinite(audio.duration) ? audio.duration : 0);

    if (this.autoplay()) {
      void audio.play();
    }
  }

  onTimeUpdate(event: Event): void {
    const audio = event.target as HTMLAudioElement;
    this.currentTime.set(audio.currentTime);
  }

  onPlay(): void {
    this.playing.set(true);
    this.playingChange.emit(true);
  }

  onPause(): void {
    this.playing.set(false);
    this.playingChange.emit(false);
  }

  onEnded(): void {
    this.playing.set(false);
    this.playingChange.emit(false);
    this.currentTime.set(0);
  }

  onSeek(event: Event): void {
    const audio = this.audioRef()?.nativeElement;
    const total = this.duration();
    if (!audio || total <= 0) return;

    const value = Number((event.target as HTMLInputElement).value);
    audio.currentTime = (value / 100) * total;
    this.currentTime.set(audio.currentTime);
  }
}

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds <= 0) return '0:00';

  const whole = Math.floor(seconds);
  const mins = Math.floor(whole / 60);
  const secs = whole % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
