import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './shared/guards';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/tabs/dashboard',
    pathMatch: 'full'
  },
  {
    path: 'auth',
    children: [
      {
        path: 'login',
        loadComponent: () => import('./auth/login.page').then(m => m.LoginPage),
        canActivate: [guestGuard]
      }
    ]
  },
  {
    path: 'tabs',
    loadChildren: () => import('./tabs/tabs.routes').then((m) => m.routes),
    canActivate: [authGuard]
  },
];
