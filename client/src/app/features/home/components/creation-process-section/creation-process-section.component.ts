import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SectionHeadingComponent } from '../../../../shared/components/section-heading/section-heading.component';
import { RevealOnScrollDirective } from '../../../../shared/directives/reveal-on-scroll.directive';
import { scrollToSectionFromNav } from '../../../../shared/utils/scroll-to.util';

export type CreationMethod = 'manual' | 'ai' | 'hybrid';

export interface CreationStage {
  step: number;
  titleHe: string;
  descriptionHe: string;
  method: CreationMethod;
  methodLabelHe: string;
}

const CREATION_STAGES: readonly CreationStage[] = [
  {
    step: 1,
    titleHe: 'כתיבת השיר',
    descriptionHe:
      'השיר נכתב גם באמצעות כלי AI — למשל כדי לנתח את כל הפרטים שאתם נותנים לנו על האדם. כלי AI לא מתמחים כיום בכתיבת שירים, ולכן נדרשת גם התערבות וכתיבה ידנית. עם ידע וניסיון רב בכתיבה והלחנת שירים — זה חלק שאנחנו מתערבים בו בעצמנו, וברמה גבוהה.',
    method: 'hybrid',
    methodLabelHe: 'AI + ידני',
  },
  {
    step: 2,
    titleHe: 'הלחנה',
    descriptionHe:
      'תהליך ההלחנה נעשה באמצעות כלי AI. גם כאן התוצאות דורשות פעמים רבות תיקונים והתערבות ידנית, עד שהשיר מרגיש מדויק.',
    method: 'hybrid',
    methodLabelHe: 'AI + ידני',
  },
  {
    step: 3,
    titleHe: 'עריכת התמונות',
    descriptionHe:
      'התמונות שאתם שולחים עוברות עריכה בכלי AI. אפשר גם לשלוח תמונות ישנות בשחור-לבן של יקיריכם — והן יקבלו צבע. יש גם אפשרות להפוך את כל התמונות לפורמט 16:9 למשל, כולל מילוי של התמונה באמצעות כלי AI. אם תרצו, תוכלו לקבל גם את התמונות הערוכות — ללא תוספת תשלום.',
    method: 'ai',
    methodLabelHe: 'כלי AI',
  },
  {
    step: 4,
    titleHe: 'הנפשה',
    descriptionHe:
      'התמונות מונפשות באמצעות כלי AI שונים, והופכות לסצנות וידאו. גם כאן יש תהליך ידני: אנחנו בוחרים אילו תמונות מתאימות להיות מונפשות יחד — לכדי סרטון אחד שמשלב שתי תמונות.',
    method: 'hybrid',
    methodLabelHe: 'AI + ידני',
  },
  {
    step: 5,
    titleHe: 'עריכת הווידאו',
    descriptionHe:
      'זה תהליך ידני: התאמה של הסרטונים למילות השיר ולמוזיקה, עריכת אפקטים שונים, התאמות כדי שהסרטונים ישולבו יחד כמו שצריך — ועוד. זה תהליך ארוך יחסית.',
    method: 'manual',
    methodLabelHe: 'ידני',
  },
  {
    step: 6,
    titleHe: 'כתוביות',
    descriptionHe: 'גם הוספת הכתוביות נעשית ידנית, כדי שיתאימו לקצב ולמילים.',
    method: 'manual',
    methodLabelHe: 'ידני',
  },
];

@Component({
  selector: 'app-creation-process-section',
  imports: [SectionHeadingComponent, RevealOnScrollDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './creation-process-section.component.html',
  styleUrl: './creation-process-section.component.scss',
})
export class CreationProcessSectionComponent {
  readonly stages = CREATION_STAGES;

  goToContact(): void {
    scrollToSectionFromNav('contact');
  }
}
