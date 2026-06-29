import { Injectable } from '@angular/core';
import { UsuarioExcluido } from '../Modelos/usuario-excluido-modelo';
import { Usuario } from '../Modelos/usuario-modelo';

@Injectable({
  providedIn: 'root',
})
export class UsuarioExclusao {
  constructor() { }
  private usuariosExcluidos: UsuarioExcluido[] = [];

  public obterUsuariosExcluidos() {
    return Object.freeze([...this.usuariosExcluidos]);
  }

  public excluir(usuarioExcluido: UsuarioExcluido): boolean {
    const tamanhoAnterior = this.usuariosExcluidos.length;
    this.usuariosExcluidos.push(usuarioExcluido);
    if (tamanhoAnterior < this.usuariosExcluidos.length) {
      return true;
    }
    return false;
  }

  public restaurar(id:number, tipoUsuario: 'Cliente' | 'Administrador' | 'Prestador'): Usuario|null  {
    const index = this.usuariosExcluidos.findIndex(
      (usuario) => usuario.id === id && usuario.tipoUsuario === tipoUsuario);
    if (index !== -1) {
      return this.usuariosExcluidos.splice(index, 1)[0]; // Remove e retorna o usuário restaurado
    }
    return null;
  }

  verificarExclusao(id: number, tipoUsuario: 'Cliente' | 'Administrador' | 'Prestador'): boolean {
    return this.usuariosExcluidos.some(
      (usuario) => usuario.id === id && usuario.tipoUsuario === tipoUsuario);
  }
}
