import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
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
  },
  {
    path: 'config',
    loadComponent: () => import('./config/config.page').then((m) => m.ConfigPage),
  },
  {
    path: 'agendamentos',
    loadComponent: () => import('./agendamentos/agendamentos.page').then((m) => m.AgendamentosPage),
  },
  {
    path: 'prestador',
    loadComponent: () => import('./prestador/prestador.page').then((m) => m.PrestadorPage),
  },
];
