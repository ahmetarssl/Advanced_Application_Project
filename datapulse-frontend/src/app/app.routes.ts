import { Routes } from '@angular/router';

export const routes: Routes = [
  // 1. Dışarıda duran sayfalar (Giriş/Kayıt)
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login').then(m => m.Login),
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register/register').then(m => m.Register),
  },

  // 2. İskeletin İÇİNDE açılacak olan korumalı sayfalar
  {
    path: '',
    loadComponent: () => import('./layouts/main-layout/main-layout').then(m => m.MainLayout),
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard').then(m => m.Dashboard),
      }
      // İleride 'chat' vb. sayfaları da buraya ekleyeceğiz.
    ]
  },

  { path: '**', redirectTo: 'login' }
];
