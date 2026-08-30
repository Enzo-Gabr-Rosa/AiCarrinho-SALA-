import { inject, Injectable } from '@angular/core';
import { Usuario } from '../Modelos/usuario-modelo';
import { clienteService } from './cliente-service';
import { administradorService } from './administador-service';
import { prestadorService } from './prestador-service';

@Injectable({
  providedIn: 'root',
})
export class autenticacaoService {
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
        this.usuarioAtual = JSON.parse(usuarioSalvo) as Usuario;
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
    this.usuarioAtual = usuario;
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
    if(!this.usuarioAtual) {
      return false;
    }
    return true;
  }
}
