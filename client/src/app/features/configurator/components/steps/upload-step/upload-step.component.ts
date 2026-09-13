import { ChangeDetectionStrategy, Component, computed, HostListener, inject, signal } from '@angular/core';
import {
  MAX_UPLOADED_IMAGES_PER_INQUIRY,
  MAX_UPLOADED_VIDEOS_PER_INQUIRY,
  MAX_VIDEO_DURATION_SECONDS,
} from '../../../../../core/config/upload-requirements.config';
import { FileUploadComponent } from '../../../../../shared/components/file-upload/file-upload.component';
import type { UploadedFileKind, UploadedFileReference } from '../../../../../shared/models/upload.model';
import { createImageThumbnailDataUrl, createVideoThumbnailDataUrl } from '../../../../../shared/utils/image-thumbnail.util';
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
export class UploadStepComponent {
  readonly store = inject(ConfiguratorStoreService);
  /** Technical server cap only — per-video max is enforced via the Next button, not upload blocking. */
  readonly maxImageFiles = MAX_UPLOADED_IMAGES_PER_INQUIRY;
  readonly maxVideoFiles = MAX_UPLOADED_VIDEOS_PER_INQUIRY;
  readonly videoError = signal<string | null>(null);
  readonly mobileHelpOpen = signal(false);
  readonly activeTab = signal<'image' | 'video'>('image');

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
    this.videoError.set(null);

    const added: { id: string; file: File }[] = [];
    for (const file of files) {
      let durationSeconds: number;
      try {
        durationSeconds = await readVideoDurationSeconds(file);
      } catch {
        this.videoError.set(`לא ניתן לקרוא את הסרטון "${file.name}". ודאו שמדובר בקובץ וידאו תקין.`);
        continue;
      }

      if (durationSeconds > MAX_VIDEO_DURATION_SECONDS) {
        this.videoError.set(`"${file.name}" ארוך מדי. אפשר להעלות סרטונים באורך עד חצי דקה.`);
        continue;
      }

      added.push(this.queueMediaFile(file, 'video', durationSeconds));
    }

    for (const item of added) {
      await this.persistSelectedFile(item.id, item.file, 'video');
      await yieldToMain();
    }
  }

  onRemoveFile(id: string): void {
    void this.store.removeUploadedFile(id);
  }

  setActiveTab(kind: 'image' | 'video'): void {
    this.activeTab.set(kind);
    this.mobileHelpOpen.set(false);
  }

  toggleMobileHelp(event: Event): void {
    event.stopPropagation();
    this.mobileHelpOpen.update((open) => !open);
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    if (this.mobileHelpOpen()) {
      this.mobileHelpOpen.set(false);
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
    try {
      await saveUploadFile(id, file, type);
    } catch {
      // Keep the in-memory File so same-session submit can still upload.
    }

    try {
      const thumbnailDataUrl =
        type === 'image'
          ? await createImageThumbnailDataUrl(file)
          : type === 'video'
            ? await createVideoThumbnailDataUrl(file)
            : null;
      if (thumbnailDataUrl) {
        this.store.updateUploadedFile(id, { thumbnailDataUrl });
      }
    } catch {
      // Keep the in-session blob preview.
    }
  }
}
