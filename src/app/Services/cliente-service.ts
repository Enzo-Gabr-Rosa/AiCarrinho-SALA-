import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Cliente } from '../Modelos/cliente-modelo';
import { Clientes } from 'src/TesteDatabase/Clientes';
import { UsuarioExclusao } from './exclusao-service';
import { Usuario } from '../Modelos/usuario-modelo';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class clienteService {
  private http = inject(HttpClient);
  private clientes: Cliente[] = [];
  private exclusaoService: UsuarioExclusao = inject(UsuarioExclusao);
  private api = `${environment.api}/clientes`;
  
  constructor() {
    this.carregarClientes();
  }

  private carregarClientes() {
    this.http.get<Cliente[]>(this.api).subscribe({
      next: (dados) => {
        this.clientes = dados.map(d => new Cliente(d.id, d.CPF, d.Nome, d.Telefone, d.Email, d.Senha));
      },
      error: () => {
        this.clientes = Clientes;
      }
    });
  }

  //Cliente
  public obterClientes() {
    return Object.freeze([...this.clientes]);
  }
  
  public adicionar(usuario: Usuario): boolean { 
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
    
    // Criar no servidor
    this.http.post<Cliente>(this.api, {
      id: cliente.id,
      CPF: cliente.CPF,
      Nome: cliente.Nome,
      Telefone: cliente.Telefone,
      Email: cliente.Email,
      Senha: cliente.Senha,
      tipoUsuario: cliente.tipoUsuario
    }).subscribe({
      next: () => {
        this.clientes.push(cliente);
      },
      error: () => {
        console.error('Erro ao adicionar cliente no servidor. Adicionando localmente.');
        this.clientes.push(cliente);
      }
    });
    return true;
  }
  
  public excluir(cliente: Cliente): boolean {
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
    
    // Deletar do servidor
    this.http.delete(`${this.api}/${cliente.id}`).subscribe({
      next: () => {
        const index = this.clientes.indexOf(cliente);
        if (index > -1) {
          this.clientes.splice(index, 1);
        }
      },
      error: () => {
        console.error('Erro ao excluir cliente no servidor.');
      }
    });
    return this.exclusaoService.excluir(usuarioExcluido);
  }

  //Complementares
  private verificarExistencia(usuario: Usuario): boolean {
    if(this.verificarCPF(usuario.CPF)){
        return true;
      } else if(this.verificarExclusao(usuario.id, 'Cliente')){
        return true;
      }
      return false;
  }
  
  public criarNovoID() {
    let i = 1;
    for(let cliente of this.clientes){
        if(i === cliente.id || this.verificarExclusao(i, 'Cliente')){
            i++
        } else {
            return i;
        }
    }
    return i;
  }
  
  public obterClientePorNome(nome: string) {
     return this.clientes.find((cliente) =>  cliente.Nome.toLowerCase() === nome.toLocaleLowerCase());
  }
  
  public obterClientePorId(id: number) {
    return this.clientes.find((cliente) =>  cliente.id === id);
  }
  
  public verificarCPF(CPF: string): boolean {
    const cliente = this.clientes.find((cliente) =>  cliente.CPF.split(/[.-]/).join('') === CPF);
    if(!cliente)
      return false;

    return true;
  }
  
  private verificarExclusao(id: number, tipoUsuario:'Cliente'): boolean {
    return this.exclusaoService.verificarExclusao(id, tipoUsuario);
  }
}
