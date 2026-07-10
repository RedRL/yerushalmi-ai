import { ChangeDetectionStrategy, Component } from '@angular/core';
import { WHATSAPP_CONFIG } from '../../../core/config/site.config';

@Component({
  selector: 'app-floating-whatsapp',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './floating-whatsapp.component.html',
  styleUrl: './floating-whatsapp.component.scss',
})
export class FloatingWhatsappComponent {
  readonly whatsappUrl = WHATSAPP_CONFIG.url;
}
