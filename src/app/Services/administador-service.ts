import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Administrador } from '../Modelos/administrador-modelo';
import { UsuarioExclusao } from './exclusao-service';
import { Usuario } from '../Modelos/usuario-modelo';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class administradorService {
  private administradores: Administrador[] = [];
  private exclusaoService: UsuarioExclusao = inject(UsuarioExclusao);
  private http = inject(HttpClient);
  private api = `${environment.api}/administradores`;

  constructor() {
    this.carregarAdministradores();
  }

  private carregarAdministradores() {
    this.http.get<Administrador[]>(this.api).subscribe({
      next: (dados) => {
        this.administradores = dados.map(d => new Administrador(
          d.id,
          d.CPF,
          d.Nome,
          d.Telefone,
          d.Email,
          d.Senha
        ));
      },
      error: () => {
        this.administradores = [];
      }
    });
  }

  //Administrador
  public obterAdministradores() {
    return Object.freeze([...this.administradores]);
  }
  public adicionar(usuario: Usuario):boolean {
      const tamanhoAnterior = this.administradores.length;
      const administrador = new Administrador(
        usuario.id,
        usuario.CPF,
        usuario.Nome,
        usuario.Telefone,
        usuario.Email,
        usuario.Senha,
      );
      if(this.verificarExistencia(usuario)){
      return false;
      }
      this.http.post<Administrador>(this.api, {
        id: administrador.id,
        CPF: administrador.CPF,
        Nome: administrador.Nome,
        Telefone: administrador.Telefone,
        Email: administrador.Email,
        Senha: administrador.Senha
      }).subscribe({
        next: () => this.administradores.push(administrador),
        error: () => this.administradores.push(administrador)
      });
      return tamanhoAnterior < this.administradores.length + 1;
    }
    public excluir(administrador: Administrador): boolean {
      const usuarioExcluido = {
      id: administrador.id,
      CPF: administrador.CPF,
      Nome: administrador.Nome,
      Telefone: administrador.Telefone,
      Email: administrador.Email,
      Senha: administrador.Senha,
      tipoUsuario: administrador.tipoUsuario,
      excluidoEm: new Date(), 
    };

    this.administradores.splice(this.administradores.indexOf(administrador), 1);
    this.http.delete(`${this.api}/${administrador.id}`).subscribe();
    return this.exclusaoService.excluir(usuarioExcluido);
  }
  //Complementares
  private verificarExistencia(usuario: Usuario):boolean{
    if(this.verificarCPF(usuario.CPF)){
        return true;
      }else if(this.verificarExclusao(usuario.id, 'Administrador')){
        return true;
      }
      return false;
  }
  private verificarCPF(CPF: string): boolean {
    const administrador = this.administradores.find((administrador) =>  administrador.CPF.split(/[.-]/).join('') === CPF); // 000.000.000.11 -> 00000000011
    return !!administrador;
  }
  public obterAdministradorPorNome(nome:string){
    return this.administradores.find((administrador) =>  administrador.Nome.toLowerCase() === nome.toLocaleLowerCase());
  }
  private verificarExclusao(id: number, tipoUsuario:'Cliente'|'Administrador'|'Prestador'):boolean{
    return this.exclusaoService.verificarExclusao(id, tipoUsuario);
  }
}
