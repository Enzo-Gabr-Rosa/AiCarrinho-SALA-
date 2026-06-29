import { Usuario } from './usuario-modelo';

export class UsuarioExcluido extends Usuario {
    excluidoEm: Date;
    excluidoPor?: number;

  constructor(
    id = 0,
    CPF = '',
    Nome = '',
    Telefone = '',
    Email = '',
    Senha = '',
    excluidoEm: Date,
    excluidoPor?: number, // id do admin que excluiu (opcional)
  ) {
    super();
    this.id = id;
    this.CPF = CPF;
    this.Nome = Nome;
    this.Telefone = Telefone;
    this.Email = Email;
    this.Senha = Senha;
    this.tipoUsuario = 'Prestador';
    this.excluidoEm = excluidoEm;
    this.excluidoPor = excluidoPor;
  }
}