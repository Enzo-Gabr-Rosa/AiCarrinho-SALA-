import { inject, Injectable } from '@angular/core';
import { Usuario } from '../Modelos/usuario-modelo';
import { clienteService } from './cliente-service';
import { administradorService } from './administador-service';
import { prestadorService } from './prestador-service';

@Injectable({
  providedIn: 'root',
})
export class autenticacaoService {
  //Verificar a utilidade do proprio serviço de autenticação, pois ele apenas chama os outros serviços, talvez seja melhor utilizar apenas o guard de rotas para verificar se o usuário está logado e qual é o tipo dele, e utilizar os serviços de cliente, administrador e prestador para obter os dados do usuário
  //Utilidade pode ser vista se e somente a ideia de se utilizar o sessionStorage
  private clienteService = inject(clienteService);
  private administradorService = inject(administradorService);
  private prestadorService = inject(prestadorService);
  private readonly STORAGE_KEY = 'sala-usuario-atual';
  private usuarioAtual: Usuario | null = null;

  public obterUsuarioAtual(): Usuario | null {
    if (!this.usuarioAtual) {
      const usuarioSalvo = localStorage.getItem(this.STORAGE_KEY);
      if (!usuarioSalvo) {
        return null;
      }
      try {
        const usuario: unknown = JSON.parse(usuarioSalvo);
        if (!this.eUsuarioValido(usuario)) {
          this.limparSessao();
          return null;
        }
        this.usuarioAtual = usuario;
      } catch {
        this.limparSessao();
      }
    }
    return this.usuarioAtual;
  }

  public definirUsuarioAtual(usuario: Usuario | null): void {
    this.usuarioAtual = usuario;
    if (!usuario) {
      localStorage.removeItem(this.STORAGE_KEY);
      return;
    }
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(usuario));
  }

  public limparSessao(): void {
    this.usuarioAtual = null;
    localStorage.removeItem(this.STORAGE_KEY);
  }

  public autenticar(nome: string, senha: string): Usuario | null {
    const usuario = this.obterUsuarioPorNome(nome);
    if (!usuario || usuario.Senha !== senha) {
      return null;
    }
    this.definirUsuarioAtual(usuario);
    return usuario;
  }

  public obterUsuarioPorNome(nome: string): Usuario | null { //?? executa o segundo comando caso o primeiro seja null ou undefined
    const usuario =
      this.clienteService.obterClientePorNome(nome) ??
      this.administradorService.obterAdministradorPorNome(nome) ??
      this.prestadorService.obterPrestadorPorNome(nome);

    return usuario ?? null;
  }

  public estaLogado(): boolean {
    return this.obterUsuarioAtual() !== null;
  }

  private eUsuarioValido(valor: unknown): valor is Usuario {
    if (typeof valor !== 'object' || valor === null) {
      return false;
    }

    const usuario = valor as Partial<Usuario>;
    return Number.isFinite(usuario.id) &&
      (usuario.tipoUsuario === 'Cliente' ||
        usuario.tipoUsuario === 'Administrador' ||
        usuario.tipoUsuario === 'Prestador');
  }
}
