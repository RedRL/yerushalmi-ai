import { ChangeDetectionStrategy, Component, ElementRef, computed, input, output, signal, viewChild } from '@angular/core';
import type { UploadedFileKind, UploadedFileReference } from '../../models/upload.model';
import { formatFileSize } from '../../utils/file-size.util';

@Component({
  selector: 'app-file-upload',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './file-upload.component.html',
  styleUrl: './file-upload.component.scss',
})
export class FileUploadComponent {
  readonly kind = input.required<UploadedFileKind>();
  readonly accept = input('');
  readonly acceptDescriptionHe = input('');
  readonly maxFiles = input(10);
  readonly maxSizeMb = input(50);
  readonly files = input<UploadedFileReference[]>([]);

  readonly filesSelected = output<File[]>();
  readonly removeFile = output<string>();

  readonly isDragging = signal(false);
  readonly errorMessage = signal<string | null>(null);

  private readonly fileInput = viewChild<ElementRef<HTMLInputElement>>('fileInput');

  readonly totalSizeLabel = computed(() =>
    formatFileSize(this.files().reduce((sum, file) => sum + file.sizeBytes, 0)),
  );

  openFileDialog(): void {
    this.fileInput()?.nativeElement.click();
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.openFileDialog();
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragging.set(true);
  }

  onDragLeave(): void {
    this.isDragging.set(false);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragging.set(false);
    if (event.dataTransfer?.files) {
      this.validateAndEmit(Array.from(event.dataTransfer.files));
    }
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
      this.errorMessage.set(`ניתן להעלות עד ${this.maxFiles()} קבצים.`);
      return;
    }

    const maxBytes = this.maxSizeMb() * 1024 * 1024;
    const validFiles: File[] = [];

    for (const file of candidateFiles.slice(0, remainingSlots)) {
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

  formatSize(bytes: number): string {
    return formatFileSize(bytes);
  }
}
