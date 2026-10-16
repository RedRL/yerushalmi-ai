import { isPlatformBrowser } from '@angular/common';
import {
  afterRenderEffect,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  HostListener,
  inject,
  PLATFORM_ID,
  signal,
  viewChild,
} from '@angular/core';
import { EmailComposeDialogService } from './email-compose-dialog.service';

@Component({
  selector: 'app-email-compose-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './email-compose-dialog.component.html',
  styleUrl: './email-compose-dialog.component.scss',
})
export class EmailComposeDialogComponent {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly dialog = inject(EmailComposeDialogService);
  private readonly panel = viewChild<ElementRef<HTMLElement>>('panel');
  private previouslyFocused: HTMLElement | null = null;
  private openAddress: string | null = null;

  readonly address = this.dialog.address;
  readonly copied = signal(false);

  readonly gmailUrl = computed(() => {
    const address = this.address();
    if (!address) return '';
    return `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(address)}`;
  });

  readonly mailtoUrl = computed(() => {
    const address = this.address();
    return address ? `mailto:${address}` : '';
  });

  constructor() {
    afterRenderEffect(() => {
      if (!isPlatformBrowser(this.platformId)) return;
      const address = this.address();
      if (address && address !== this.openAddress) {
        this.openAddress = address;
        this.copied.set(false);
        this.previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
        document.body.style.overflow = 'hidden';
        this.panel()?.nativeElement.focus();
        return;
      }

      if (!address && this.openAddress) {
        this.openAddress = null;
        document.body.style.overflow = '';
        this.previouslyFocused?.focus();
        this.previouslyFocused = null;
      }
    });
  }

  close(): void {
    this.dialog.close();
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) this.close();
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.address()) this.close();
  }

  async copyAddress(): Promise<void> {
    const address = this.address();
    if (!address || !isPlatformBrowser(this.platformId)) return;

    try {
      await navigator.clipboard.writeText(address);
      this.copied.set(true);
    } catch {
      this.copied.set(false);
    }
  }
}
