import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  Injector,
  OnDestroy,
  afterNextRender,
  computed,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import type { UploadedFileKind, UploadedFileReference } from '../../models/upload.model';
import { isAcceptedFileType } from '../../utils/file-type.util';
import { cloneUploadFile, cloneUploadFiles } from '../../utils/upload-file-store.util';
import {
  resolveUploadedFileLightboxUrl,
  resolveUploadedFileTileUrl,
} from '../../utils/image-thumbnail.util';
import { yieldToMain } from '../../utils/yield-to-main.util';

interface RelativeRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

const OPEN_FLIGHT_DURATION_MS = 280;
const OPEN_BACKDROP_DURATION_MS = 240;
const CLOSE_FLIGHT_DURATION_MS = 420;
const CLOSE_BACKDROP_DURATION_MS = 340;
const FLIGHT_EASING = 'cubic-bezier(0.4, 0, 0.2, 1)';

interface FlightTiming {
  flightMs: number;
  backdropMs: number;
}

interface FlightAnimationOptions {
  /** Hide the lightbox image only after the flight shell is painted (close animation). */
  hideLightboxImage?: HTMLImageElement;
}

@Component({
  selector: 'app-file-upload',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './file-upload.component.html',
  styleUrl: './file-upload.component.scss',
})
export class FileUploadComponent implements OnDestroy {
  readonly kind = input.required<UploadedFileKind>();
  readonly accept = input('');
  readonly acceptDescriptionHe = input('');
  /** 0 = no file-count limit. */
  readonly maxFiles = input(0);
  /** 0 = no file-size limit. */
  readonly maxSizeMb = input(0);
  readonly files = input<UploadedFileReference[]>([]);
  readonly extraErrors = input<string[]>([]);

  readonly filesSelected = output<File[]>();
  readonly removeFile = output<string>();
  readonly selectionStarted = output<void>();

  readonly promptNoun = computed(() => {
    if (this.kind() === 'video') return 'סרטונים';
    if (this.kind() === 'audio') return 'קבצי שמע';
    return 'תמונות';
  });

  readonly allErrors = computed(() => [...this.extraErrors(), ...this.errorMessages()]);

  readonly isDragging = signal(false);
  readonly isImporting = signal(false);
  readonly errorMessages = signal<string[]>([]);

  clearError(): void {
    this.errorMessages.set([]);
  }

  private addError(message: string): void {
    this.errorMessages.update((current) => (current.includes(message) ? current : [...current, message]));
  }
  readonly previewedFileId = signal<string | null>(null);
  readonly isOpeningPreview = signal(false);
  readonly isClosingPreview = signal(false);
  readonly flightActive = signal(false);
  readonly flightAnimating = signal(false);
  readonly flightRect = signal<RelativeRect>({ top: 0, left: 0, width: 0, height: 0 });
  readonly flightImageUrl = signal('');

  readonly previewedFile = computed(() => {
    const id = this.previewedFileId();
    if (!id) return null;
    return this.files().find((file) => file.id === id) ?? null;
  });

  private readonly injector = inject(Injector);
  private readonly hostRef = inject(ElementRef<HTMLElement>);
  private readonly fileInput = viewChild<ElementRef<HTMLInputElement>>('fileInput');
  private readonly gallery = viewChild<ElementRef<HTMLElement>>('gallery');
  private readonly lightboxRoot = viewChild<ElementRef<HTMLElement>>('lightboxRoot');
  private readonly lightboxDialog = viewChild<ElementRef<HTMLElement>>('lightboxDialog');
  private readonly lightboxImage = viewChild<ElementRef<HTMLImageElement>>('lightboxImage');
  private readonly lightboxVideo = viewChild<ElementRef<HTMLVideoElement>>('lightboxVideo');
  private readonly flightShell = viewChild<ElementRef<HTMLElement>>('flightShell');
  private previewOriginElement: HTMLElement | null = null;
  private backdropAnimation: Animation | null = null;
  private flightTimeoutId: ReturnType<typeof setTimeout> | null = null;
  private pinnedScrolls: { el: HTMLElement; top: number }[] = [];
  private pinnedWindowY = 0;

  ngOnDestroy(): void {
    this.abortFlight();
    this.finishClose(true);
  }

  tileUrl(file: UploadedFileReference): string | undefined {
    return resolveUploadedFileTileUrl(file);
  }

  lightboxUrl(file: UploadedFileReference): string | undefined {
    return resolveUploadedFileLightboxUrl(file);
  }

  canPreview(file: UploadedFileReference): boolean {
    if (file.type === 'video') {
      return Boolean(this.lightboxUrl(file));
    }
    return Boolean(file.lightboxPreviewUrl || file.thumbnailDataUrl);
  }

  openPreview(file: UploadedFileReference, event: Event): void {
    if (!this.canPreview(file)) return;

    const origin = (event.currentTarget as HTMLElement | null)?.closest('.file-upload__preview');
    this.previewOriginElement = origin instanceof HTMLElement ? origin : null;
    this.pinScrollPositions();
    if (event.currentTarget instanceof HTMLElement) {
      event.currentTarget.blur();
    }

    const useMotion = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.isOpeningPreview.set(useMotion);
    this.previewedFileId.set(file.id);

    afterNextRender(() => {
      this.attachLightboxToPanel();
      this.restorePinnedScrolls();

      if (!useMotion || file.type === 'video') {
        this.completeOpen();
        this.playLightboxVideo();
        return;
      }

      void this.startOpenAnimation();
    }, { injector: this.injector });
  }

  closePreview(): void {
    if (!this.previewedFileId() || this.isOpeningPreview() || this.isClosingPreview()) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.finishClose(true);
      return;
    }

    void this.startCloseAnimation();
  }

  private async startOpenAnimation(): Promise<void> {
    await this.waitForFrames(2);

    const lightbox = this.lightboxRoot()?.nativeElement;
    const image = this.lightboxImage()?.nativeElement;
    const thumb = this.getPreviewThumbElement();

    if (!lightbox || !image || !thumb) {
      this.completeOpen();
      return;
    }

    lightbox.style.opacity = '0';
    image.style.opacity = '0';
    this.restorePinnedScrolls();

    await this.ensureImageReady(image);
    this.restorePinnedScrolls();
    await this.waitForFrames(2);
    this.restorePinnedScrolls();

    const lightboxRect = lightbox.getBoundingClientRect();
    const fromRel = this.toLightboxRelativeRect(thumb.getBoundingClientRect(), lightboxRect);
    const toRel = this.measureDisplayedImageRect(image, lightbox);

    this.runFlightAnimation(fromRel, toRel, 0, 1, () => this.completeOpen(), {
      flightMs: OPEN_FLIGHT_DURATION_MS,
      backdropMs: OPEN_BACKDROP_DURATION_MS,
    });
  }

  private startCloseAnimation(): void {
    this.restorePinnedScrolls();
    const lightbox = this.lightboxRoot()?.nativeElement;
    const image = this.lightboxImage()?.nativeElement;
    const thumb = this.getPreviewThumbElement();

    if (!lightbox || !image || !thumb) {
      this.finishClose(true);
      return;
    }

    this.isClosingPreview.set(true);

    const lightboxRect = lightbox.getBoundingClientRect();
    const fromRel = this.measureDisplayedImageRect(image, lightbox);
    const toRel = this.toLightboxRelativeRect(thumb.getBoundingClientRect(), lightboxRect);

    this.runFlightAnimation(
      fromRel,
      toRel,
      1,
      0,
      () => this.finishClose(),
      {
        flightMs: CLOSE_FLIGHT_DURATION_MS,
        backdropMs: CLOSE_BACKDROP_DURATION_MS,
      },
      { hideLightboxImage: image },
    );
  }

  private pinScrollPositions(): void {
    this.pinnedScrolls = [];
    this.pinnedWindowY = window.scrollY;
    const add = (el: HTMLElement | null | undefined): void => {
      if (!el || this.pinnedScrolls.some((item) => item.el === el)) return;
      this.pinnedScrolls.push({ el, top: el.scrollTop });
    };

    add(this.gallery()?.nativeElement);
    const body = this.hostRef.nativeElement.closest('.configurator__body');
    if (body instanceof HTMLElement) add(body);
    const panel = this.hostRef.nativeElement.closest('.configurator__panel');
    if (panel instanceof HTMLElement) add(panel);
  }

  private restorePinnedScrolls(): void {
    if (window.scrollY !== this.pinnedWindowY) {
      window.scrollTo({ top: this.pinnedWindowY, left: 0, behavior: 'instant' });
    }
    for (const item of this.pinnedScrolls) {
      if (item.el.scrollTop !== item.top) {
        item.el.scrollTop = item.top;
      }
    }
  }

  private getPreviewThumbElement(): HTMLElement | null {
    const fileId = this.previewedFileId();
    return (
      this.previewOriginElement ??
      (fileId
        ? (this.hostRef.nativeElement.querySelector(
            `[data-preview-id="${fileId}"]`,
          ) as HTMLElement | null)
        : null)
    );
  }

  private runFlightAnimation(
    fromRel: RelativeRect,
    toRel: RelativeRect,
    backdropFrom: number,
    backdropTo: number,
    onComplete: () => void,
    timing: FlightTiming,
    options?: FlightAnimationOptions,
  ): void {
    const lightbox = this.lightboxRoot()?.nativeElement;
    const image = this.lightboxImage()?.nativeElement;
    if (!lightbox || !image) {
      onComplete();
      return;
    }

    this.resetFlightSignals();

    lightbox.style.opacity = String(backdropFrom);
    this.flightImageUrl.set(image.currentSrc || image.src);
    this.flightRect.set(fromRel);
    this.flightActive.set(true);
    this.flightAnimating.set(false);

    afterNextRender(() => {
      void this.beginFlightTransition(
        lightbox,
        fromRel,
        toRel,
        backdropFrom,
        backdropTo,
        onComplete,
        timing,
        options,
      );
    }, { injector: this.injector });
  }

  private async beginFlightTransition(
    lightbox: HTMLElement,
    fromRel: RelativeRect,
    toRel: RelativeRect,
    backdropFrom: number,
    backdropTo: number,
    onComplete: () => void,
    timing: FlightTiming,
    options?: FlightAnimationOptions,
  ): Promise<void> {
    const shell = this.flightShell()?.nativeElement;
    if (!shell) {
      onComplete();
      return;
    }

    void shell.offsetWidth;

    const flightImg = shell.querySelector('img');
    if (flightImg instanceof HTMLImageElement) {
      await this.ensureImageReady(flightImg);
    }

    if (options?.hideLightboxImage) {
      options.hideLightboxImage.style.opacity = '0';
    }

    this.backdropAnimation = lightbox.animate(
      [{ opacity: backdropFrom }, { opacity: backdropTo }],
      { duration: timing.backdropMs, easing: 'ease-out', fill: 'forwards' },
    );

    let completed = false;
    const finish = (): void => {
      if (completed) return;
      completed = true;
      if (this.flightTimeoutId) {
        clearTimeout(this.flightTimeoutId);
        this.flightTimeoutId = null;
      }
      onComplete();
    };

    shell.addEventListener(
      'transitionend',
      (event) => {
        if (event.target === shell && event.propertyName === 'width') {
          finish();
        }
      },
      { once: true },
    );

    void this.backdropAnimation.finished.catch(() => undefined).then(finish);
    this.flightTimeoutId = setTimeout(finish, timing.flightMs + 80);

    shell.style.transition = this.buildFlightTransition(timing.flightMs);
    this.flightAnimating.set(true);
    this.flightRect.set(toRel);
  }

  private completeOpen(): void {
    this.resetFlightSignals();

    const lightbox = this.lightboxRoot()?.nativeElement;
    const image = this.lightboxImage()?.nativeElement;
    if (image) {
      image.style.opacity = '1';
    }
    if (lightbox) {
      lightbox.style.opacity = '1';
    }

    this.isOpeningPreview.set(false);
    this.lightboxDialog()?.nativeElement.focus({ preventScroll: true });
    this.restorePinnedScrolls();
  }

  private buildFlightTransition(durationMs: number): string {
    return [
      `top ${durationMs}ms ${FLIGHT_EASING}`,
      `left ${durationMs}ms ${FLIGHT_EASING}`,
      `width ${durationMs}ms ${FLIGHT_EASING}`,
      `height ${durationMs}ms ${FLIGHT_EASING}`,
    ].join(', ');
  }

  private measureDisplayedImageRect(image: HTMLImageElement, lightbox: HTMLElement): RelativeRect {
    const lightboxRect = lightbox.getBoundingClientRect();
    const rect = image.getBoundingClientRect();

    if (rect.width >= 1 && rect.height >= 1) {
      return this.toLightboxRelativeRect(rect, lightboxRect);
    }

    const wrap = image.parentElement;
    if (!wrap) {
      return this.fallbackExpandedRect(lightbox);
    }

    const wrapRect = wrap.getBoundingClientRect();
    const width = Math.min(wrapRect.width, lightboxRect.width - 96);
    const height = Math.min(wrapRect.height, lightboxRect.height - 96);
    const left = wrapRect.left + (wrapRect.width - width) / 2;
    const top = wrapRect.top + (wrapRect.height - height) / 2;

    return this.toLightboxRelativeRect(new DOMRect(left, top, width, height), lightboxRect);
  }

  private fallbackExpandedRect(lightbox: HTMLElement): RelativeRect {
    const width = Math.min(lightbox.clientWidth - 96, 640);
    const height = Math.min(lightbox.clientHeight - 96, width * 0.75);
    return {
      top: (lightbox.clientHeight - height) / 2,
      left: (lightbox.clientWidth - width) / 2,
      width,
      height,
    };
  }

  private async ensureImageReady(image: HTMLImageElement): Promise<void> {
    if (!image.complete) {
      await new Promise<void>((resolve) => {
        const done = (): void => resolve();
        image.addEventListener('load', done, { once: true });
        image.addEventListener('error', done, { once: true });
      });
    }

    await image.decode().catch(() => undefined);
  }

  private toLightboxRelativeRect(rect: DOMRect, lightboxRect: DOMRect): RelativeRect {
    return {
      top: rect.top - lightboxRect.top,
      left: rect.left - lightboxRect.left,
      width: rect.width,
      height: rect.height,
    };
  }

  private waitForFrames(count: number): Promise<void> {
    return new Promise((resolve) => {
      const step = (remaining: number): void => {
        if (remaining <= 0) {
          resolve();
          return;
        }
        requestAnimationFrame(() => step(remaining - 1));
      };
      step(count);
    });
  }

  private resetFlightSignals(): void {
    if (this.flightTimeoutId) {
      clearTimeout(this.flightTimeoutId);
      this.flightTimeoutId = null;
    }
    this.flightActive.set(false);
    this.flightAnimating.set(false);
    this.backdropAnimation = null;
  }

  private abortFlight(): void {
    this.backdropAnimation?.cancel();
    this.resetFlightSignals();
  }

  private finishClose(skipAnimation = false): void {
    if (skipAnimation) {
      this.abortFlight();
    } else {
      this.resetFlightSignals();
    }

    this.pauseLightboxVideo();
    this.isOpeningPreview.set(false);
    this.isClosingPreview.set(false);
    this.previewOriginElement = null;
    this.previewedFileId.set(null);
    this.detachLightboxFromPanel();
    this.restorePinnedScrolls();
    requestAnimationFrame(() => {
      this.restorePinnedScrolls();
      requestAnimationFrame(() => {
        this.restorePinnedScrolls();
        this.pinnedScrolls = [];
      });
    });
  }

  private playLightboxVideo(): void {
    const video = this.lightboxVideo()?.nativeElement;
    if (!video) return;
    void video.play().catch(() => undefined);
  }

  private pauseLightboxVideo(): void {
    const video = this.lightboxVideo()?.nativeElement;
    if (!video) return;
    video.pause();
    video.currentTime = 0;
  }

  private attachLightboxToPanel(): void {
    if (!this.previewedFileId()) return;

    const panel = this.hostRef.nativeElement.closest('.configurator__panel') as HTMLElement | null;
    const lightbox = this.lightboxRoot()?.nativeElement;
    if (!panel || !lightbox) return;

    panel.appendChild(lightbox);

    if (this.isOpeningPreview()) {
      lightbox.style.opacity = '0';
    }
  }

  private detachLightboxFromPanel(): void {
    const lightbox = this.lightboxRoot()?.nativeElement;
    const anchor = this.getLightboxAnchor();
    if (!lightbox || !anchor || lightbox.parentElement === anchor) return;

    anchor.appendChild(lightbox);
  }

  private getLightboxAnchor(): HTMLElement {
    return (
      this.hostRef.nativeElement.querySelector('.file-upload') ?? this.hostRef.nativeElement
    );
  }

  onLightboxBackdropClick(event: MouseEvent): void {
    if (this.isOpeningPreview() || this.isClosingPreview()) return;

    if (event.target === event.currentTarget) {
      this.closePreview();
    }
  }

  @HostListener('document:keydown', ['$event'])
  onDocumentKeydown(event: KeyboardEvent): void {
    if (
      event.key === 'Escape' &&
      this.previewedFileId() &&
      !this.isOpeningPreview() &&
      !this.isClosingPreview()
    ) {
      event.preventDefault();
      this.closePreview();
    }
  }

  openFileDialog(): void {
    this.fileInput()?.nativeElement.click();
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.openFileDialog();
    }
  }

  onGalleryDragStart(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
  }

  onDragOver(event: DragEvent): void {
    if (window.matchMedia('(max-width: 1023px)').matches) return;
    if (!this.isExternalFileDrag(event)) return;

    event.preventDefault();
    this.isDragging.set(true);
  }

  onDragLeave(): void {
    this.isDragging.set(false);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragging.set(false);

    if (window.matchMedia('(max-width: 1023px)').matches) return;
    if (!this.isExternalFileDrag(event)) return;

    const files = event.dataTransfer?.files;
    if (files?.length) {
      this.beginSelection();
      void cloneUploadFiles(Array.from(files)).then((durable) => this.validateAndEmit(durable));
    }
  }

  private isExternalFileDrag(event: DragEvent): boolean {
    const types = event.dataTransfer?.types;
    if (!types) return false;

    return Array.from(types).includes('Files');
  }

  async onFileInputChange(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const picked = input.files ? Array.from(input.files) : [];
    if (picked.length === 0) return;

    this.isImporting.set(true);
    this.beginSelection();
    try {
      // Clone while the input still owns the FileList. Clearing first empties files on iOS.
      for (const file of picked) {
        const durable = await cloneUploadFile(file);
        this.validateAndEmit([durable]);
        await yieldToMain();
      }
    } finally {
      input.value = '';
      this.isImporting.set(false);
    }
  }

  private beginSelection(): void {
    this.errorMessages.set([]);
    this.selectionStarted.emit();
  }

  private validateAndEmit(candidateFiles: File[]): void {
    const cap = this.maxFiles();
    const remainingSlots = cap > 0 ? Math.max(0, cap - this.files().length) : Number.POSITIVE_INFINITY;
    if (remainingSlots <= 0) {
      this.addError(
        cap > 0
          ? `לא ניתן להוסיף עוד ${this.promptNoun()}. המקסימום הוא ${cap}.`
          : `לא ניתן להוסיף עוד ${this.promptNoun()}.`,
      );
      return;
    }

    if (cap > 0 && candidateFiles.length > remainingSlots) {
      this.addError(`ניתן להוסיף עוד ${remainingSlots} ${this.promptNoun()} בלבד (מקסימום ${cap}).`);
    }

    const maxBytes = this.maxSizeMb() > 0 ? this.maxSizeMb() * 1024 * 1024 : Number.POSITIVE_INFINITY;
    const validFiles: File[] = [];
    const accept = this.accept();
    const acceptLabel = this.acceptDescriptionHe() || 'קבצים מהסוג המותר';

    for (const file of candidateFiles.slice(0, remainingSlots)) {
      if (!isAcceptedFileType(file, accept)) {
        const typeLabel = this.kind() === 'image' ? 'תמונה נתמכת' : this.kind() === 'video' ? 'סרטון נתמך' : 'קובץ נתמך';
        this.addError(`"${file.name}" אינו ${typeLabel}. ניתן להעלות ${acceptLabel}.`);
        continue;
      }

      if (file.size <= 0) {
        this.addError(`לא ניתן לקרוא את הקובץ "${file.name}". נסו לבחור אותו שוב.`);
        continue;
      }

      if (file.size > maxBytes) {
        this.addError(`הקובץ "${file.name}" חורג מהגודל המקסימלי המותר (${this.maxSizeMb()}MB).`);
        continue;
      }
      validFiles.push(file);
    }

    if (validFiles.length > 0) {
      this.filesSelected.emit(validFiles);
    }
  }
}
