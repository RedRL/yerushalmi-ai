import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ScrollRestorationService } from './core/services/scroll-restoration.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
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
