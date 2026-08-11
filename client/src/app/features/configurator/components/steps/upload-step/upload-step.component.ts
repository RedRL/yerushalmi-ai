import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { UploadApiService } from '../../../../../core/services/upload-api.service';
import { FileUploadComponent } from '../../../../../shared/components/file-upload/file-upload.component';
import type { UploadedFileKind, UploadedFileReference } from '../../../../../shared/models/upload.model';
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
  readonly videoFiles = computed(() => this.store.uploadedFiles().filter((file) => file.type === 'video'));

  async onFilesSelected(files: File[], kind: UploadedFileKind): Promise<void> {
    for (const file of files) {
      const reference: UploadedFileReference = {
        id: this.store.generateFileId(),
        type: kind,
        name: file.name,
        sizeBytes: file.size,
        storageKey: '',
        status: 'uploading',
        previewUrl: kind === 'image' ? URL.createObjectURL(file) : undefined,
      };

      this.store.addUploadedFile(reference);

      try {
        const result = await this.uploadApi.registerFile(file, kind);
        this.store.updateUploadedFile(reference.id, {
          status: 'complete',
          storageKey: result.storageKey,
          url: result.url,
        });
      } catch {
        this.store.updateUploadedFile(reference.id, {
          status: 'error',
          errorMessageHe: 'ההעלאה נכשלה. נסו שוב.',
        });
      }
    }
  }

  onRemoveFile(id: string): void {
    this.store.removeUploadedFile(id);
  }
}
