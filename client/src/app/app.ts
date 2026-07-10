import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FloatingWhatsappComponent } from './shared/components/floating-whatsapp/floating-whatsapp.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, FloatingWhatsappComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {}
