import { inject, Injectable } from '@angular/core';
import { Cliente } from '../Modelos/cliente-modelo';
import { Clientes } from 'src/TesteDatabase/Clientes';
import { UsuarioExclusao } from './exclusao-service';
import { Usuario } from '../Modelos/usuario-modelo';

@Injectable({
  providedIn: 'root',
})
export class clienteService {
  private clientes: Cliente[] = [];
  private exclusaoService: UsuarioExclusao = inject(UsuarioExclusao);
  constructor() {
    this.clientes = Clientes;
  }

  //Cliente
  public obterClientes() {
    return Object.freeze([...this.clientes]);
  }
  public adicionar(usuario:Usuario):boolean{ 
    const tamanhoAnterior = this.clientes.length;
    const cliente = new Cliente(
      usuario.id,
      usuario.CPF,
      usuario.Nome,
      usuario.Telefone,
      usuario.Email,
      usuario.Senha
    );
    if(this.verificarExistencia(usuario)){
      return false;
    }
    this.clientes.push(cliente);
    if(tamanhoAnterior < this.clientes.length){
        return true;
    }else {
        return false;
    }
  }
  public excluir(cliente: Cliente):boolean{
    const usuarioExcluido = {
      id: cliente.id,
      CPF: cliente.CPF,
      Nome: cliente.Nome,
      Telefone: cliente.Telefone,
      Email: cliente.Email,
      Senha: cliente.Senha,
      tipoUsuario: cliente.tipoUsuario,
      excluidoEm: new Date(), 
    };
    this.clientes.splice(this.clientes.indexOf(cliente), 1);
    return this.exclusaoService.excluir(usuarioExcluido);
  }

  //Complementares
  private verificarExistencia(usuario: Usuario):boolean{
    if(this.verificarCPF(usuario.CPF)){
        return true;
      }else if(this.verificarExclusao(usuario.id, 'Cliente')){
        return true;
      }
      return false;
  }
  public criarNovoID(){ 
    let i = 1;
    for(let cliente of this.clientes){
        if(i === cliente.id){
            i++
        }else{
            return i;
        }
    }
    return i;
  }
  public obterClientePorNome(nome:string){
     return this.clientes.find((cliente) =>  cliente.Nome.toLowerCase() === nome.toLocaleLowerCase());//optimizar depois
  }
  public obterClientePorId(id:number){
    return this.clientes.find((cliente) =>  cliente.id === id);
  }
  public verificarCPF(CPF:string):boolean{
    const cliente = this.clientes.find((cliente) =>  cliente.CPF.split(/[.-]/).join('') === CPF); // 000.000.000.11 -> 00000000011
    return !!cliente; // Retorna true se o cliente existir, false caso contrário
  
  }
  private verificarExclusao(id: number, tipoUsuario:'Cliente'): boolean {
    return this.exclusaoService.verificarExclusao(id, tipoUsuario);
  }
}
