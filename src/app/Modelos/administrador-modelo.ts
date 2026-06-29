import { Usuario } from './usuario-modelo';

export class Administrador extends Usuario {
  constructor(
    id = 0,
    CPF = '',
    Nome = '',
    Telefone = '',
    Email = '',
    Senha = ''
  ) {
    super();
    this.id = id;
    this.CPF = CPF;
    this.Nome = Nome;
    this.Telefone = Telefone;
    this.Email = Email;
    this.Senha = Senha;
    this.tipoUsuario = 'Administrador';
  }
}