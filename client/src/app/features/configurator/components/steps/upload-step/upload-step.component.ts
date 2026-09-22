import { ChangeDetectionStrategy, Component, computed, effect, HostListener, inject, OnDestroy, signal, viewChildren } from '@angular/core';
import { MAX_VIDEO_DURATION_SECONDS } from '../../../../../core/config/upload-requirements.config';
import { FileUploadComponent } from '../../../../../shared/components/file-upload/file-upload.component';
import type { UploadedFileKind, UploadedFileReference } from '../../../../../shared/models/upload.model';
import { createImagePreviewSet, createVideoThumbnailDataUrl } from '../../../../../shared/utils/image-thumbnail.util';
import { saveUploadFile } from '../../../../../shared/utils/upload-file-store.util';
import { readVideoDurationSeconds } from '../../../../../shared/utils/video-duration.util';
import { yieldToMain } from '../../../../../shared/utils/yield-to-main.util';
import { ConfiguratorStoreService } from '../../../state/configurator-store.service';

@Component({
  selector: 'app-upload-step',
  imports: [FileUploadComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './upload-step.component.html',
  styleUrl: './upload-step.component.scss',
})
export class UploadStepComponent implements OnDestroy {
  readonly store = inject(ConfiguratorStoreService);
  readonly videoErrors = signal<string[]>([]);
  readonly helpTab = signal<'image' | 'video' | null>(null);
  readonly activeTab = signal<'image' | 'video'>('image');
  private readonly uploads = viewChildren(FileUploadComponent);
  private readonly previewJobs = new Set<string>();
  private helpHideTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    effect(() => {
      for (const file of this.store.uploadedFiles()) {
        if (file.file && !file.thumbnailDataUrl) {
          void this.ensureFilePreview(file.id);
        }
      }
    });
  }

  readonly imageFiles = computed(() => this.store.uploadedFiles().filter((file) => file.type === 'image'));
  readonly videoFiles = computed(() => this.store.uploadedFiles().filter((file) => file.type === 'video'));
  readonly imageCountGuidanceHe = computed(() => {
    const min = this.store.minimumRequiredImages();
    const recommended = this.store.recommendedMaxImages();
    const max = this.store.maximumAllowedImages();
    return `יש לספק ${min}-${recommended} תמונות ועד ${max} לכל היותר - בהתאם לאורך הסרטון שנבחר.`;
  });
  readonly videoCountGuidanceHe = computed(() => {
    const max = this.store.maximumAllowedVideos();
    return `אפשר להוסיף סרטונים של עד חצי דקה, ועד ${max} סרטונים לכל היותר - בהתאם לאורך הסרטון שנבחר.`;
  });
  readonly orderGuidanceHe =
    'אם חשוב לכם שהתמונות/סרטונים יופיעו בסדר מסוים, כדאי לתת שמות כרונולוגיים ברורים (למשל 1, 2, 3...). אחרת, נסדר אותם כפי שנראה לנו לנכון בהתאם לחומרים עצמם ולשיר ברקע.';

  async onImagesSelected(files: File[]): Promise<void> {
    const added = files.map((file) => this.queueMediaFile(file, 'image'));
    for (const item of added) {
      await this.persistSelectedFile(item.id, item.file, 'image');
      await yieldToMain();
    }
  }

  async onVideosSelected(files: File[]): Promise<void> {
    const added = files.map((file) => this.queueMediaFile(file, 'video'));
    for (const item of added) {
      let durationSeconds: number;
      try {
        durationSeconds = await readVideoDurationSeconds(item.file);
      } catch {
        this.addVideoError(`לא ניתן לקרוא את הסרטון "${item.file.name}". ודאו שמדובר בקובץ וידאו תקין.`);
        this.store.removeUploadedFile(item.id);
        continue;
      }

      if (durationSeconds > MAX_VIDEO_DURATION_SECONDS) {
        this.addVideoError(`"${item.file.name}" ארוך מדי. אפשר להעלות סרטונים באורך עד חצי דקה.`);
        this.store.removeUploadedFile(item.id);
        continue;
      }

      this.store.updateUploadedFile(item.id, { durationSeconds });
      await this.persistSelectedFile(item.id, item.file, 'video');
      await yieldToMain();
    }
  }

  onRemoveFile(id: string): void {
    void this.store.removeUploadedFile(id);
  }

  setActiveTab(kind: 'image' | 'video'): void {
    this.activeTab.set(kind);
    this.closeHelp();
    this.clearErrors();
  }

  usesHoverHelp(): boolean {
    return window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  }

  toggleHelp(kind: 'image' | 'video', event: Event): void {
    event.stopPropagation();
    if (this.usesHoverHelp()) return;
    if (this.helpTab() === kind) {
      this.closeHelp();
      return;
    }
    this.openHelp(kind);
  }

  showHelp(kind: 'image' | 'video'): void {
    if (!this.usesHoverHelp()) return;
    this.openHelp(kind);
  }

  scheduleHideHelp(): void {
    if (!this.usesHoverHelp()) return;
    this.clearHelpHideTimeout();
    this.helpHideTimeout = setTimeout(() => this.closeHelp(), 120);
  }

  keepHelp(): void {
    if (!this.usesHoverHelp()) return;
    this.clearHelpHideTimeout();
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    if (this.usesHoverHelp()) return;
    this.closeHelp();
  }

  ngOnDestroy(): void {
    this.clearHelpHideTimeout();
  }

  clearErrors(): void {
    this.videoErrors.set([]);
    for (const upload of this.uploads()) {
      upload.clearError();
    }
  }

  private addVideoError(message: string): void {
    this.videoErrors.update((current) => (current.includes(message) ? current : [...current, message]));
  }

  private openHelp(kind: 'image' | 'video'): void {
    this.clearHelpHideTimeout();
    this.helpTab.set(kind);
  }

  private closeHelp(): void {
    this.clearHelpHideTimeout();
    this.helpTab.set(null);
  }

  private clearHelpHideTimeout(): void {
    if (this.helpHideTimeout) {
      clearTimeout(this.helpHideTimeout);
      this.helpHideTimeout = null;
    }
  }

  private queueMediaFile(
    file: File,
    type: UploadedFileKind,
    durationSeconds?: number,
  ): { id: string; file: File } {
    const id = this.store.generateFileId();
    const previewUrl = URL.createObjectURL(file);
    const reference: UploadedFileReference = {
      id,
      type,
      name: file.name,
      sizeBytes: file.size,
      storageKey: '',
      status: 'pending',
      file,
      previewUrl,
      durationSeconds,
    };

    this.store.addUploadedFile(reference);
    return { id, file };
  }

  private async persistSelectedFile(id: string, file: File, type: UploadedFileKind): Promise<void> {
    await this.ensureFilePreview(id);
    try {
      await saveUploadFile(id, file, type);
    } catch {
      // Keep the in-memory File so same-session submit can still upload.
    }
  }

  private async ensureFilePreview(id: string): Promise<void> {
    if (this.previewJobs.has(id)) return;

    const reference = this.store.uploadedFiles().find((file) => file.id === id);
    if (!reference?.file || reference.thumbnailDataUrl) return;

    this.previewJobs.add(id);
    try {
      if (reference.type === 'image') {
        const previews = await createImagePreviewSet(reference.file);
        this.store.updateUploadedFile(id, {
          thumbnailDataUrl: previews.thumbnailDataUrl,
          lightboxPreviewUrl: previews.lightboxPreviewUrl,
          previewUrl: undefined,
        });
        return;
      }

      if (reference.type === 'video') {
        const thumbnailDataUrl = await createVideoThumbnailDataUrl(reference.file);
        this.store.updateUploadedFile(id, { thumbnailDataUrl });
      }
    } catch {
      // Tile spinner stays until a later retry or the user removes the file.
    } finally {
      this.previewJobs.delete(id);
    }
  }
}
