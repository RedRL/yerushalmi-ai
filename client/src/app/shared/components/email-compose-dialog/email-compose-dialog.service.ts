import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class EmailComposeDialogService {
  private readonly addressState = signal<string | null>(null);
  readonly address = this.addressState.asReadonly();

  open(address: string): void {
    this.addressState.set(address);
  }

  close(): void {
    this.addressState.set(null);
  }
}
