import { Injectable, signal } from '@angular/core';
import type { VocalistId } from '../../../shared/models/pricing.model';

const STYLE_FILES: Record<string, string> = {
  'פופ': 'pop.mp3',
  'רוק': 'rock.mp3',
  'ים תיכוני': 'mediterranean.mp3',
  'בלדה': 'ballad.mp3',
  'היפ הופ': 'hip hop.mp3',
  'גוספל': 'gospel.mp3',
  'קאנטרי': 'country.mp3',
  'בלוז': 'blues.mp3',
  'אינדי': 'indie.mp3',
};

const VOICE_FILES: Record<VocalistId, string> = {
  male: 'male.mp3',
  female: 'female.mp3',
  both: 'male & female.mp3',
};

@Injectable({ providedIn: 'root' })
export class StylePreviewPlayer {
  readonly playingId = signal<string | null>(null);

  private audio: HTMLAudioElement | null = null;

  playStyle(style: string): void {
    const file = STYLE_FILES[style];
    if (!file) {
      this.stop();
      return;
    }
    this.play(`style:${style}`, audioUrl('genres', file));
  }

  playVoice(id: VocalistId): void {
    this.play(`voice:${id}`, audioUrl('voices', VOICE_FILES[id]));
  }

  stop(): void {
    if (!this.audio) {
      this.playingId.set(null);
      return;
    }
    this.audio.pause();
    this.audio.src = '';
    this.audio = null;
    this.playingId.set(null);
  }

  private play(id: string, src: string): void {
    this.stop();
    const audio = new Audio(src);
    audio.preload = 'auto';
    this.audio = audio;
    this.playingId.set(id);
    audio.addEventListener('ended', () => {
      if (this.audio === audio) this.stop();
    });
    void audio.play().catch(() => {
      if (this.audio === audio) this.stop();
    });
  }
}

function audioUrl(folder: 'genres' | 'voices', file: string): string {
  return `/audio/${folder}/${encodeURIComponent(file)}`;
}
