import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { MAX_UPLOADED_IMAGES_PER_INQUIRY } from '../../../../../core/config/upload-requirements.config';
import { FileUploadComponent } from '../../../../../shared/components/file-upload/file-upload.component';
import type { UploadedFileReference } from '../../../../../shared/models/upload.model';
import { createImageThumbnailDataUrl } from '../../../../../shared/utils/image-thumbnail.util';
import { saveUploadFile } from '../../../../../shared/utils/upload-file-store.util';
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

  readonly imageFiles = computed(() => this.store.uploadedFiles().filter((file) => file.type === 'image'));

  async onFilesSelected(files: File[]): Promise<void> {
    for (const file of files) {
      let thumbnailDataUrl: string | undefined;
      try {
        thumbnailDataUrl = await createImageThumbnailDataUrl(file);
      } catch {
        // Fall back to in-session blob preview only.
      }

      const id = this.store.generateFileId();

      try {
        await saveUploadFile(id, file, 'image');
      } catch {
        this.store.addUploadedFile({
          id,
          type: 'image',
          name: file.name,
          sizeBytes: file.size,
          storageKey: '',
          status: 'error',
          previewUrl: URL.createObjectURL(file),
          thumbnailDataUrl,
          errorMessageHe: 'לא ניתן לשמור את התמונה במכשיר. נסו שוב.',
        });
        continue;
      }

      const reference: UploadedFileReference = {
        id,
        type: 'image',
        name: file.name,
        sizeBytes: file.size,
        storageKey: '',
        status: 'pending',
        file,
        previewUrl: URL.createObjectURL(file),
        thumbnailDataUrl,
      };

      this.store.addUploadedFile(reference);
    }
  }

  onRemoveFile(id: string): void {
    void this.store.removeUploadedFile(id);
  }
}
