import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import {
  MAX_UPLOADED_IMAGES_PER_INQUIRY,
  MAX_UPLOADED_VIDEOS_PER_INQUIRY,
  MAX_VIDEO_DURATION_SECONDS,
} from '../../../../../core/config/upload-requirements.config';
import { FileUploadComponent } from '../../../../../shared/components/file-upload/file-upload.component';
import type { UploadedFileKind, UploadedFileReference } from '../../../../../shared/models/upload.model';
import { createImageThumbnailDataUrl } from '../../../../../shared/utils/image-thumbnail.util';
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

  readonly imageFiles = computed(() => this.store.uploadedFiles().filter((file) => file.type === 'image'));
  readonly videoFiles = computed(() => this.store.uploadedFiles().filter((file) => file.type === 'video'));

  async onImagesSelected(files: File[]): Promise<void> {
    for (const file of files) {
      await this.addMediaFile(file, 'image');
      await yieldToMain();
    }
  }

  async onVideosSelected(files: File[]): Promise<void> {
    this.videoError.set(null);

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

      await this.addMediaFile(file, 'video', durationSeconds);
      await yieldToMain();
    }
  }

  onRemoveFile(id: string): void {
    void this.store.removeUploadedFile(id);
  }

  scrollToUpload(kind: UploadedFileKind): void {
    document.getElementById(`upload-${kind}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  toggleMobileHelp(): void {
    this.mobileHelpOpen.update((open) => !open);
  }

  private async addMediaFile(file: File, type: UploadedFileKind, durationSeconds?: number): Promise<void> {
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
    void this.persistFileInBackground(id, file, type);
  }

  private async persistFileInBackground(id: string, file: File, type: UploadedFileKind): Promise<void> {
    try {
      await saveUploadFile(id, file, type);
    } catch {
      return;
    }

    if (type !== 'image') return;

    try {
      const thumbnailDataUrl = await createImageThumbnailDataUrl(file);
      this.store.updateUploadedFile(id, { thumbnailDataUrl });
    } catch {
      // Keep the in-session blob preview.
    }
  }
}
