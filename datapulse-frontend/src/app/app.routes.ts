import { Routes } from '@angular/router';
import { authGuard, roleGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login').then(m => m.Login),
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register/register').then(m => m.Register),
  },
  {
    path: '',
    loadComponent: () => import('./layouts/main-layout/main-layout').then(m => m.MainLayout),
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard').then(m => m.Dashboard),
      },
      {
        path: 'ai-assistant',
        loadComponent: () => import('./features/chat/chat').then(m => m.Chat),
      },
      {
        path: 'analytics',
        loadComponent: () => import('./features/analytics/analytics').then(m => m.Analytics),
        canActivate: [roleGuard('ADMIN', 'CORPORATE')],
      },
      {
        path: 'orders',
        loadComponent: () => import('./features/orders/orders').then(m => m.Orders),
      },
      {
        path: 'products',
        loadComponent: () => import('./features/products/products').then(m => m.Products),
      },
      {
        path: 'customers',
        loadComponent: () => import('./features/customers/customers').then(m => m.Customers),
        canActivate: [roleGuard('ADMIN', 'CORPORATE')],
      },
      {
        path: 'store-settings',
        loadComponent: () => import('./features/store-settings/store-settings').then(m => m.StoreSettings),
        canActivate: [roleGuard('CORPORATE')],
      },
      {
        path: 'shipments',
        loadComponent: () => import('./features/shipments/shipments').then(m => m.Shipments),
      },
      {
        path: 'reviews',
        loadComponent: () => import('./features/reviews/reviews').then(m => m.Reviews),
      },
      {
        path: 'profile',
        loadComponent: () => import('./features/profile/profile').then(m => m.Profile),
      },
      {
        path: 'admin/users',
        loadComponent: () => import('./features/admin/users/admin-users').then(m => m.AdminUsers),
        canActivate: [roleGuard('ADMIN')],
      },
      {
        path: 'admin/stores',
        loadComponent: () => import('./features/admin/stores/admin-stores').then(m => m.AdminStores),
        canActivate: [roleGuard('ADMIN')],
      },
      {
        path: 'admin/categories',
        loadComponent: () => import('./features/admin/categories/admin-categories').then(m => m.AdminCategories),
        canActivate: [roleGuard('ADMIN')],
      },
    ],
  },
  { path: '**', redirectTo: 'login' }
];
