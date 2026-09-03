import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  HostListener,
  inject,
  signal,
} from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { FIELD_LIMITS } from '../../../../../core/config/field-limits.config';
import { getSongLengthOptions, SONG_STYLE_OPTIONS, VOCALIST_OPTIONS } from '../../../../../core/config/pricing.config';
import type { SongLengthId, VocalistId } from '../../../../../shared/models/pricing.model';
import { ConfiguratorStoreService } from '../../../state/configurator-store.service';

@Component({
  selector: 'app-song-step',
  imports: [ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './song-step.component.html',
  styleUrl: './song-step.component.scss',
})
export class SongStepComponent {
  private readonly destroyRef = inject(DestroyRef);
  private readonly hostRef = inject(ElementRef<HTMLElement>);

  readonly store = inject(ConfiguratorStoreService);
  readonly styleOptions = SONG_STYLE_OPTIONS;
  readonly vocalistOptions = VOCALIST_OPTIONS;
  readonly limits = FIELD_LIMITS;
  readonly lengthMenuOpen = signal(false);
  readonly lengthMenuBox = signal({ top: 0, left: 0, width: 0 });
  private readonly lengthUiRevision = signal(0);

  readonly lengthOptions = computed(() => getSongLengthOptions(this.store.mainProduct()));

  readonly lengthFieldLabel = computed(() =>
    this.store.isFullExperience() ? 'אורך משוער (שיר וסרטון)' : 'אורך משוער',
  );

  readonly selectedLengthId = computed((): SongLengthId | '' => {
    this.lengthUiRevision();
    this.lengthOptions();
    return this.store.songForm.controls.length.value ?? '';
  });

  readonly selectedLengthLabel = computed(() => {
    const id = this.selectedLengthId();
    const options = this.lengthOptions();
    return options.find((option) => option.id === id)?.labelHe ?? options[0]?.labelHe ?? '';
  });

  readonly showStyleSelectionError = computed(
    () =>
      this.store.selectedSongStyles().length === 0 && this.store.songForm.controls.style.touched,
  );

  readonly showCustomStyleError = computed(() => {
    const styles = this.store.selectedSongStyles();
    return (
      styles.length === 1 &&
      styles[0] === 'אחר' &&
      this.store.songCustomStyleTouched() &&
      this.store.songCustomStyleText().trim().length === 0
    );
  });

  constructor() {
    const onScroll = (): void => this.closeLengthMenu();
    document.addEventListener('scroll', onScroll, { capture: true, passive: true });
    this.destroyRef.onDestroy(() => {
      document.removeEventListener('scroll', onScroll, { capture: true });
    });
  }

  lengthOptionLabel(option: { id: SongLengthId; labelHe: string; price: number }): string {
    return option.labelHe;
  }

  readonly showVocalistError = computed(
    () =>
      this.store.songForm.controls.vocalist.touched &&
      !this.store.songForm.controls.vocalist.value,
  );

  selectVocalist(id: VocalistId): void {
    this.store.selectVocalist(id);
  }

  toggleLengthMenu(event: Event): void {
    event.stopPropagation();
    if (this.lengthMenuOpen()) {
      this.closeLengthMenu();
      return;
    }

    const trigger = event.currentTarget as HTMLElement;
    const rect = trigger.getBoundingClientRect();
    const estimatedMenuHeight = this.lengthOptions().length * 38 + 12;
    const opensUpward = rect.bottom + estimatedMenuHeight > window.innerHeight;
    this.lengthMenuBox.set({
      top: opensUpward ? Math.max(8, rect.top - estimatedMenuHeight - 6) : rect.bottom + 6,
      left: rect.left,
      width: rect.width,
    });
    this.lengthMenuOpen.set(true);
  }

  selectLength(id: SongLengthId, event: Event): void {
    event.stopPropagation();
    this.store.songForm.controls.length.setValue(id);
    this.store.songForm.controls.length.markAsTouched();
    this.lengthUiRevision.update((value) => value + 1);
    this.closeLengthMenu();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.lengthMenuOpen()) return;
    const target = event.target;
    const root = this.hostRef.nativeElement.querySelector('.length-select');
    if (target instanceof Node && root?.contains(target)) return;
    this.closeLengthMenu();
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.closeLengthMenu();
  }

  @HostListener('window:resize')
  onResize(): void {
    this.closeLengthMenu();
  }

  private closeLengthMenu(): void {
    this.lengthMenuOpen.set(false);
  }
}
