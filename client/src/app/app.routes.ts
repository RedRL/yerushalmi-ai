import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/home.component').then((m) => m.HomeComponent),
    title: 'YERUSHALMI.AI | קליפים מוזיקליים ושירים בהתאמה אישית',
  },
  {
    path: 'terms',
    loadComponent: () => import('./features/terms/terms.component').then((m) => m.TermsComponent),
    title: 'YERUSHALMI.AI | תקנון שירות',
  },
  {
    path: '**',
    redirectTo: '',
  },
];
