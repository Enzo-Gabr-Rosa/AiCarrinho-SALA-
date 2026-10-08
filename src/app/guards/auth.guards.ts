import { inject } from '@angular/core';
import { CanActivateFn, Router} from '@angular/router';
import { Usuario } from '../Modelos/usuario-modelo';
import { autenticacaoService } from '../Services/autenticacao-service';

export const authGuard: CanActivateFn = () => {
  const autenticacao = inject(autenticacaoService);
  const router = inject(Router);

  return autenticacao.estaLogado() || router.navigate(['/login']);
};

export const papelGuard: CanActivateFn = (route) => {
  const autenticacao = inject(autenticacaoService);
  const router = inject(Router);
  const usuario = autenticacao.obterUsuarioAtual();

  if (!usuario) {
    return router.navigate(['/login']);
  }

  const tipoRequerido = route.data['papel'] as Usuario['tipoUsuario'] | undefined;
  if (!tipoRequerido || usuario.tipoUsuario === tipoRequerido) {
    return true;
  }

  return router.navigate(['/perfil']);
};