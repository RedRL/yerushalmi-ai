import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { environment } from '../../../../../../environments/environment';
import { UploadApiService } from '../../../../../core/services/upload-api.service';
import { FileUploadComponent } from '../../../../../shared/components/file-upload/file-upload.component';
import type { UploadedFileReference } from '../../../../../shared/models/upload.model';
import { createImageThumbnailDataUrl } from '../../../../../shared/utils/image-thumbnail.util';
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
  private readonly uploadApi = inject(UploadApiService);

  readonly imageFiles = computed(() => this.store.uploadedFiles().filter((file) => file.type === 'image'));

  async onFilesSelected(files: File[]): Promise<void> {
    for (const file of files) {
      let thumbnailDataUrl: string | undefined;
      try {
        thumbnailDataUrl = await createImageThumbnailDataUrl(file);
      } catch {
        // Fall back to in-session blob preview only.
      }

      const reference: UploadedFileReference = {
        id: this.store.generateFileId(),
        type: 'image',
        name: file.name,
        sizeBytes: file.size,
        storageKey: '',
        status: 'uploading',
        previewUrl: URL.createObjectURL(file),
        thumbnailDataUrl,
      };

      this.store.addUploadedFile(reference);

      try {
        const result = await this.uploadApi.registerFile(file, 'image');
        this.store.updateUploadedFile(reference.id, {
          status: 'complete',
          storageKey: result.storageKey,
          url: result.url,
        });
      } catch (error) {
        if (!environment.production) {
          // Mock storage does not persist bytes — keep local preview usable in development.
          this.store.updateUploadedFile(reference.id, {
            status: 'complete',
            storageKey: `local/dev/${reference.id}/${file.name}`,
            url: reference.previewUrl,
          });
          continue;
        }

        const message =
          error instanceof Error && error.message.includes('תקשורת')
            ? 'לא ניתן להתחבר לשרת. ודאו שהשרת פועל ונסו שוב.'
            : 'ההעלאה נכשלה. נסו שוב.';
        this.store.updateUploadedFile(reference.id, {
          status: 'error',
          errorMessageHe: message,
        });
      }
    }
  }

  onRemoveFile(id: string): void {
    this.store.removeUploadedFile(id);
  }
}
