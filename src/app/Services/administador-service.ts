import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Administrador } from '../Modelos/administrador-modelo';
import { Usuario } from '../Modelos/usuario-modelo';
import { environment } from 'src/environments/environment';
import { firstValueFrom } from 'rxjs';
import { cpf } from 'cpf-cnpj-validator';

@Injectable({
  providedIn: 'root',
})
export class administradorService {
  private http = inject(HttpClient);
  private api = `${environment.api}/administradores`;

  //________________________________________________________
  //CRUD
  public async obterAdministradores(): Promise<Administrador[]> {
    const dados = await firstValueFrom(this.http.get<Administrador[]>(this.api));
    const administradores: Administrador[] = [];
    dados.forEach(dado => {
      administradores.push(new Administrador(
        dado.id,
        dado.CPF,
        dado.Nome,
        dado.Telefone,
        dado.Email,
        dado.Senha
      ));
    });
    return administradores;
  }

  public async adicionar(usuario: Usuario): Promise<Administrador | null> {
    const administrador = new Administrador(
      await this.novoId(),
      usuario.CPF,
      usuario.Nome,
      usuario.Telefone,
      usuario.Email,
      usuario.Senha
    );

    try {
      if (await this.verificarCPF(administrador.CPF)) {
        return null;
      }

      const criado = await firstValueFrom(this.http.post<Administrador>(this.api, {
        CPF: administrador.CPF,
        Nome: administrador.Nome,
        Telefone: administrador.Telefone,
        Email: administrador.Email,
        Senha: administrador.Senha,
      }));
      return new Administrador(criado.id, criado.CPF, criado.Nome, criado.Telefone, criado.Email, criado.Senha);
    } catch {
      return null;
    }
  }

  public async excluir(administrador: Administrador): Promise<boolean> {
    try {
      await firstValueFrom(this.http.delete(`${this.api}/${administrador.id}`));
      return true;
    } catch {
      return false;
    }
  }

  //________________________________________________________
  //Verificadores 
  public async verificarCPF(CPF: string): Promise<boolean> {
    const cpfNormalizado = cpf.strip(CPF);
    const administradores = await this.obterAdministradores();
    return administradores.some(administrador => cpf.strip(administrador.CPF) === cpfNormalizado);
  }

  //________________________________________________________
  //Pesquisadores
  public async obterAdministradorPorNome(nome: string): Promise<Administrador | undefined> {
    const administradores = await this.obterAdministradores();
    return administradores.find(administrador => administrador.Nome.toLocaleLowerCase() === nome.toLocaleLowerCase());
  }

  public async obterAdministradorPorId(id: number): Promise<Administrador | undefined> {
    const administradores = await this.obterAdministradores();
    return administradores.find(administrador => String(administrador.id) === String(id));
  }

  public async obterAdministradorPorCPF(cpfInformado: string): Promise<Administrador | undefined> {
    const cpfNormalizado = cpf.strip(cpfInformado);
    const administradores = await this.obterAdministradores();
    return administradores.find(administrador => cpf.strip(administrador.CPF) === cpfNormalizado);
  }

  //________________________________________________________
  //Complementares
  private async novoId(): Promise<number> {
    const administradores = await this.obterAdministradores();
    const ids: number[] = [];
    administradores.forEach(administrador => {
      ids.push(administrador.id);
    });
    return ids.length > 0 ? Math.max(...ids) + 1 : 1;
  }

}
