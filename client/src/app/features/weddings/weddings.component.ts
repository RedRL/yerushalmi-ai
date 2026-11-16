import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SITE_CONFIG } from '../../core/config/site.config';

/** Placeholder until the dedicated weddings landing is built. */
@Component({
  selector: 'app-weddings',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main class="weddings">
      <p class="weddings__brand">{{ brand }}</p>
      <h1>חתונות</h1>
      <p>הדף הייעודי לחתונות בבנייה. בינתיים אפשר לחזור לבניית קליפ רגיל.</p>
      <a routerLink="/clips">חזרה לקליפים</a>
    </main>
  `,
  styles: `
    .weddings {
      min-height: 100dvh;
      display: grid;
      place-content: center;
      gap: 0.75rem;
      padding: 2rem;
      text-align: center;
      background: radial-gradient(circle at 50% 20%, rgba(139, 92, 246, 0.16), transparent 55%),
        linear-gradient(180deg, #0b0d16 0%, #121526 100%);
      color: #f4f1ff;
    }

    .weddings__brand {
      margin: 0;
      letter-spacing: 0.08em;
      font-size: 0.85rem;
      opacity: 0.72;
    }

    h1 {
      margin: 0;
      font-size: clamp(2rem, 4vw, 3rem);
    }

    p {
      margin: 0;
      max-width: 28rem;
      justify-self: center;
      line-height: 1.6;
      color: rgba(244, 241, 255, 0.78);
    }

    a {
      margin-top: 0.5rem;
      color: #c4b5fd;
      font-weight: 600;
    }
  `,
})
export class WeddingsComponent {
  readonly brand = SITE_CONFIG.brandName;
}
