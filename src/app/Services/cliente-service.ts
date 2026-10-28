import { inject, Injectable } from '@angular/core';
import { Cliente } from '../Modelos/cliente-modelo';
import { Usuario } from '../Modelos/usuario-modelo';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { cpf } from 'cpf-cnpj-validator';

@Injectable({
  providedIn: 'root',
})
export class clienteService {
  private http = inject(HttpClient);
  private api = `${environment.api}/clientes`;

  //________________________________________________________
  //CRUD
  public async obterClientes(): Promise<Cliente[]> {
    const dados = await firstValueFrom(this.http.get<Cliente[]>(this.api));
    const clientes: Cliente[] = [];
    dados.forEach((cliente: Cliente) => {
      clientes.push(new Cliente(cliente.id, cliente.CPF, cliente.Nome, cliente.Telefone, cliente.Email, cliente.Senha));
    });
    return clientes;
  }

  public async adicionar(usuario: Usuario): Promise<Cliente | null> {
    let emailParaEnviar;
    if (usuario.Email === "") {
      emailParaEnviar = null;
    } else { emailParaEnviar = usuario.Email }
    const cliente = new Cliente(
      await this.novoId(),
      usuario.CPF,
      usuario.Nome,
      usuario.Telefone,
      usuario.Email,
      usuario.Senha
    );

    try {
      if (await this.verificarCPF(usuario.CPF)) {
        return null;
      }

      const criado = await firstValueFrom(this.http.post<Cliente>(this.api, {
        CPF: cliente.CPF,
        Nome: cliente.Nome,
        Telefone: cliente.Telefone,
        Email: emailParaEnviar,
        Senha: cliente.Senha,
      }));
      return new Cliente(criado.id, criado.CPF, criado.Nome, criado.Telefone, criado.Email, criado.Senha);
    } catch {
      return null;
    }
  }
  public async alterarDados(
    id: number,
    dados: Partial<Pick<Cliente, 'Nome' | 'CPF' | 'Telefone' | 'Senha'>> & { Email?: string | null }
  ): Promise<boolean> {
    try {
      await firstValueFrom(this.http.patch(`${this.api}/${id}`, dados));
      return true;
    } catch (erro) {
      console.error('Erro ao alterar dados do cliente:', erro);
      return false;
    }
  }

  public async excluir(cliente: Cliente): Promise<boolean> {
    try {
      await firstValueFrom(this.http.delete(`${this.api}/${cliente.id}`));
      return true;
    } catch {
      return false;
    }
  }

  //________________________________________________________
  //Pesquisadores
  public async obterClientePorCPF(cpfInformado: string): Promise<Cliente | undefined> {
    const clientes = await this.obterClientes();
    return clientes.find(cliente => cpf.strip(cliente.CPF) === cpf.strip(cpfInformado));
  }
  public async obterClientePorNome(nome: string): Promise<Cliente | undefined> {
    const clientes = await this.obterClientes();
    return clientes.find(cliente => cliente.Nome.toLocaleLowerCase() === nome.toLocaleLowerCase());
  }

  public async obterClientePorId(id: number): Promise<Cliente | undefined> {
    const clientes = await this.obterClientes();
    return clientes.find(cliente => String(cliente.id) === String(id));
  }


  //________________________________________________________
  //Verificadores
  public async verificarCPF(CPF: string): Promise<boolean> {
    const cpfNormalizado = cpf.strip(CPF);
    const clientes = await this.obterClientes();
    return clientes.some(cliente => cpf.strip(cliente.CPF) === cpfNormalizado);
  }

  //________________________________________________________
  //Complementares
  private async novoId(): Promise<number> {
    const clientes = await this.obterClientes();
    const ids: number[] = [];
    clientes.forEach(cliente => {
      ids.push(cliente.id);
    });
    if (ids.length === 0) {
      return -1;
    }
    return Math.max(...ids) + 1;
  }

}
