import { Directive, HostListener, inject } from '@angular/core';
import { EmailComposeDialogService } from '../components/email-compose-dialog/email-compose-dialog.service';

/** Opens the compose chooser instead of handing the click straight to the system mail app. */
@Directive({
  selector: 'a[appEmailCompose]',
})
export class EmailComposeDirective {
  private readonly dialog = inject(EmailComposeDialogService);

  @HostListener('click', ['$event'])
  onClick(event: MouseEvent): void {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

    event.preventDefault();
    const href = (event.currentTarget as HTMLAnchorElement).getAttribute('href') ?? '';
    const address = decodeURIComponent(href.replace(/^mailto:/i, '').split('?')[0]).trim();
    if (!address) return;
    this.dialog.open(address);
  }
}
