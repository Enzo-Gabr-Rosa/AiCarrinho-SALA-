export abstract class Usuario {
  id!: number;
  CPF!: string;
  Nome!: string;
  Telefone!: string;
  Email!: string;
  Senha!: string;
  tipoUsuario!: 'Cliente' | 'Administrador' | 'Prestador';
}
