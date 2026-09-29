import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Usuario } from '../Modelos/usuario-modelo';
import { autenticacaoService } from '../Services/autenticacao-service';

export const authGuard: CanActivateFn = () => {
  const autenticacao = inject(autenticacaoService);
  const router = inject(Router);

  return autenticacao.estaLogado() || router.createUrlTree(['/login']);
};

export const papelGuard: CanActivateFn = (route) => {
  const autenticacao = inject(autenticacaoService);
  const router = inject(Router);
  const usuario = autenticacao.obterUsuarioAtual();

  if (!usuario) {
    return router.createUrlTree(['/login']);
  }

  const papelRequerido = route.data['papel'] as Usuario['tipoUsuario'] | undefined;
  if (!papelRequerido || usuario.tipoUsuario === papelRequerido) {
    return true;
  }

  return router.createUrlTree(['/perfil']);
};