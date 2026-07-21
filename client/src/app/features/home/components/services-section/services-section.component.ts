import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SectionHeadingComponent } from '../../../../shared/components/section-heading/section-heading.component';
import { RevealOnScrollDirective } from '../../../../shared/directives/reveal-on-scroll.directive';
import type { ServiceItem } from '../../../../shared/models/service-item.model';
import { scrollToConfigurator } from '../../../../shared/utils/scroll-to.util';

const SERVICES: readonly ServiceItem[] = [
  {
    id: 'song-only',
    icon: 'song',
    titleHe: 'שיר אישי בלבד',
    descriptionHe: 'שיר מקורי שנכתב לפי האדם, הסיפור, הזיכרונות והסגנון שתבחרו.',
  },
  {
    id: 'video-existing-song',
    icon: 'video-existing-song',
    titleHe: 'קליפ עם שיר קיים',
    descriptionHe: 'אתם מספקים שיר קיים, ואנחנו יוצרים עבורו קליפ המבוסס על תמונות, סרטונים או סצנות שנוצרות באמצעות AI.',
  },
  {
    id: 'video-new-song',
    icon: 'video-new-song',
    titleHe: 'קליפ עם שיר אישי חדש',
    descriptionHe: 'חבילה מלאה הכוללת כתיבה ויצירה של שיר אישי יחד עם קליפ מוזיקלי מותאם.',
  },
  {
    id: 'video-photos',
    icon: 'photos',
    titleHe: 'קליפ מתמונות אמיתיות',
    descriptionHe: 'תמונות שהלקוח מספק הופכות לסצנות וידאו קולנועיות ומרגשות.',
  },
  {
    id: 'video-ai',
    icon: 'ai-visual',
    titleHe: 'קליפ AI מלא',
    descriptionHe: 'הוויזואליה נוצרת מאפס בהתאם לסיפור, לקונספט ולאווירה הרצויה.',
  },
];

const HIGHLIGHTED_ID = 'video-new-song';

@Component({
  selector: 'app-services-section',
  imports: [SectionHeadingComponent, RevealOnScrollDirective, NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './services-section.component.html',
  styleUrl: './services-section.component.scss',
})
export class ServicesSectionComponent {
  readonly highlighted: ServiceItem = SERVICES.find((service) => service.id === HIGHLIGHTED_ID) ?? SERVICES[0];
  readonly supporting: readonly ServiceItem[] = SERVICES.filter((service) => service.id !== HIGHLIGHTED_ID);

  goToConfigurator(): void {
    scrollToConfigurator();
  }
}
