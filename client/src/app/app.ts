import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ScrollRestorationService } from './core/services/scroll-restoration.service';
import { FloatingWhatsappComponent } from './shared/components/floating-whatsapp/floating-whatsapp.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, FloatingWhatsappComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit {
  private readonly scrollRestoration = inject(ScrollRestorationService);

  ngOnInit(): void {
    this.scrollRestoration.init();
  }
}
