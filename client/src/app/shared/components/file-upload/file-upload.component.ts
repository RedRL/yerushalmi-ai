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
import { resolveUploadedFilePreviewUrl } from '../../utils/image-thumbnail.util';

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
  readonly maxFiles = input(10);
  readonly maxSizeMb = input(50);
  readonly files = input<UploadedFileReference[]>([]);

  readonly filesSelected = output<File[]>();
  readonly removeFile = output<string>();

  readonly promptNoun = computed(() => {
    if (this.kind() === 'video') return 'סרטונים';
    if (this.kind() === 'audio') return 'קבצי שמע';
    return 'תמונות';
  });

  readonly isDragging = signal(false);
  readonly errorMessage = signal<string | null>(null);
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
  private readonly lightboxRoot = viewChild<ElementRef<HTMLElement>>('lightboxRoot');
  private readonly lightboxDialog = viewChild<ElementRef<HTMLElement>>('lightboxDialog');
  private readonly lightboxImage = viewChild<ElementRef<HTMLImageElement>>('lightboxImage');
  private readonly flightShell = viewChild<ElementRef<HTMLElement>>('flightShell');
  private previewOriginElement: HTMLElement | null = null;
  private backdropAnimation: Animation | null = null;
  private flightTimeoutId: ReturnType<typeof setTimeout> | null = null;

  ngOnDestroy(): void {
    this.abortFlight();
    this.finishClose(true);
  }

  previewUrl(file: UploadedFileReference): string | undefined {
    return resolveUploadedFilePreviewUrl(file);
  }

  canPreview(file: UploadedFileReference): boolean {
    return this.kind() === 'image' && Boolean(this.previewUrl(file));
  }

  openPreview(file: UploadedFileReference, event: Event): void {
    if (!this.canPreview(file)) return;

    const origin = (event.currentTarget as HTMLElement | null)?.closest('.file-upload__preview');
    this.previewOriginElement = origin instanceof HTMLElement ? origin : null;

    const useMotion = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.isOpeningPreview.set(useMotion);
    this.previewedFileId.set(file.id);

    afterNextRender(() => {
      this.attachLightboxToPanel();

      if (!useMotion) {
        this.lightboxDialog()?.nativeElement.focus();
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

    await this.ensureImageReady(image);
    await this.waitForFrames(2);

    const lightboxRect = lightbox.getBoundingClientRect();
    const fromRel = this.toLightboxRelativeRect(thumb.getBoundingClientRect(), lightboxRect);
    const toRel = this.measureDisplayedImageRect(image, lightbox);

    this.runFlightAnimation(fromRel, toRel, 0, 1, () => this.completeOpen(), {
      flightMs: OPEN_FLIGHT_DURATION_MS,
      backdropMs: OPEN_BACKDROP_DURATION_MS,
    });
  }

  private startCloseAnimation(): void {
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
    this.lightboxDialog()?.nativeElement.focus();
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

    this.isOpeningPreview.set(false);
    this.isClosingPreview.set(false);
    this.previewOriginElement = null;
    this.previewedFileId.set(null);
    this.detachLightboxFromPanel();
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
      this.validateAndEmit(Array.from(files));
    }
  }

  private isExternalFileDrag(event: DragEvent): boolean {
    const types = event.dataTransfer?.types;
    if (!types) return false;

    return Array.from(types).includes('Files');
  }

  onFileInputChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.validateAndEmit(Array.from(input.files));
    }
    input.value = '';
  }

  private validateAndEmit(candidateFiles: File[]): void {
    this.errorMessage.set(null);

    const remainingSlots = this.maxFiles() - this.files().length;
    if (remainingSlots <= 0) {
      return;
    }

    const maxBytes = this.maxSizeMb() * 1024 * 1024;
    const validFiles: File[] = [];
    const accept = this.accept();
    const acceptLabel = this.acceptDescriptionHe() || 'קבצים מהסוג המותר';

    for (const file of candidateFiles.slice(0, remainingSlots)) {
      if (!isAcceptedFileType(file, accept)) {
        const typeLabel = this.kind() === 'image' ? 'תמונה נתמכת' : this.kind() === 'video' ? 'סרטון נתמך' : 'קובץ נתמך';
        this.errorMessage.set(`"${file.name}" אינו ${typeLabel}. ניתן להעלות ${acceptLabel}.`);
        continue;
      }

      if (file.size > maxBytes) {
        this.errorMessage.set(`הקובץ "${file.name}" חורג מהגודל המקסימלי המותר (${this.maxSizeMb()}MB).`);
        continue;
      }
      validFiles.push(file);
    }

    if (validFiles.length > 0) {
      this.filesSelected.emit(validFiles);
    }
  }
}
