import { ChangeDetectionStrategy, Component } from '@angular/core';

import { SectionHeadingComponent } from '../../../../shared/components/section-heading/section-heading.component';

import { RevealOnScrollDirective } from '../../../../shared/directives/reveal-on-scroll.directive';

import type { ProcessStep } from '../../../../shared/models/process-step.model';



const PROCESS_STEPS: readonly ProcessStep[] = [

  { step: 1, titleHe: 'בוחרים את סוג הפרויקט', descriptionHe: 'שיר, קליפ או שילוב מלא של שיר וקליפ.' },

  { step: 2, titleHe: 'מתאימים את האפשרויות', descriptionHe: 'בוחרים סוג וידאו, כתוביות, פורמטים, אורך ותוספות.' },

  {

    step: 3,

    titleHe: 'שולחים פרטים וחומרים',

    descriptionHe: 'מספיקות תמונות ותיאור קצר — אנחנו בונים את הקליפ מהתמונות עצמן, יחד עם כל הפרטים החשובים.',

  },

  {

    step: 4,

    titleHe: 'אנחנו עוברים על הבקשה',

    descriptionHe: 'לאחר מעבר על החומרים והפרטים, אנחנו חוזרים אליכם לאישור סופי ולהמשך התהליך.',

  },

];



@Component({

  selector: 'app-process-section',

  imports: [SectionHeadingComponent, RevealOnScrollDirective],

  changeDetection: ChangeDetectionStrategy.OnPush,

  templateUrl: './process-section.component.html',

  styleUrl: './process-section.component.scss',

})

export class ProcessSectionComponent {

  readonly steps = PROCESS_STEPS;

}

