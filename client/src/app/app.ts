import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LocaleService } from './core/i18n/locale.service';
import { ScrollRestorationService } from './core/services/scroll-restoration.service';
import { EmailComposeDialogComponent } from './shared/components/email-compose-dialog/email-compose-dialog.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, EmailComposeDialogComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit {
  private readonly scrollRestoration = inject(ScrollRestorationService);
  /** Eagerly construct so document lang/dir sync on boot. */
  private readonly locale = inject(LocaleService);

  ngOnInit(): void {
    this.scrollRestoration.init();
    void this.locale;
  }
}
