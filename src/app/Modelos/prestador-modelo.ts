import { Usuario } from './usuario-modelo';
import { Servico } from './servico-modelo';

export class Prestador extends Usuario {
  Descricao: string;
  Servicos: Servico[] = [];

  constructor(
    id = 0,
    CPF = '',
    Nome = '',
    Telefone = '',
    Email = '',
    Senha = '',
    Descricao = '',
    Servicos: Servico[] = []
  ) {
    super();
    this.id = id;
    this.CPF = CPF;
    this.Nome = Nome;
    this.Telefone = Telefone;
    this.Email = Email;
    this.Senha = Senha;
    this.Descricao = Descricao;
    this.Servicos = Servicos;
    this.tipoUsuario = 'Prestador';
  }
}