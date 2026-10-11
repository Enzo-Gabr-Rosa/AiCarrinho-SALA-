import { inject } from '@angular/core';
import { CanActivateFn, Router} from '@angular/router';
import { Usuario } from '../Modelos/usuario-modelo';
import { autenticacaoService } from '../Services/autenticacao-service';

export const authGuard: CanActivateFn = () => {
  const autenticacao = inject(autenticacaoService);
  const router = inject(Router);

  return autenticacao.estaLogado() || router.navigate(['/login']);
};

export const tipoGuard: CanActivateFn = (route) => {
  const autenticacao = inject(autenticacaoService);
  const router = inject(Router);
  const usuario = autenticacao.obterUsuarioAtual();

  if (!usuario) {
    return router.navigate(['/login']);
  }

  const tipoRequerido = route.data['tipo'] as Usuario['tipoUsuario'];
  if (usuario.tipoUsuario === tipoRequerido) {
    return true;
  }

  return router.navigate(['/perfil']);
};