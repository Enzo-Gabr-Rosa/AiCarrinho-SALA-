import { Routes } from '@angular/router';
import { authGuard, papelGuard } from './guards/auth.guards';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
    canActivate: [authGuard],
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () => import('./login/login.page').then((m) => m.LoginPage),
  },
  {
    path: 'perfil',
    loadComponent: () => import('./perfil/perfil.page').then((m) => m.PerfilPage),
    canActivate: [authGuard],
  },
  {
    path: 'config',
    loadComponent: () => import('./config/config.page').then((m) => m.ConfigPage),
    canActivate: [authGuard],
  },
  {
    path: 'agendamentos',
    loadComponent: () => import('./agendamentos/agendamentos.page').then((m) => m.AgendamentosPage),
    canActivate: [authGuard],
    data: { papel: 'Prestador' },
  },
  {
    path: 'prestador',
    loadComponent: () => import('./prestador/prestador.page').then((m) => m.PrestadorPage),
    canActivate: [authGuard],
    data: { papel: 'Prestador' },
  },
];
