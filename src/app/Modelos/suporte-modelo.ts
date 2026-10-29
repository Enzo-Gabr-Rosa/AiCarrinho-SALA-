export class Suporte {
    id:number;
    idAdministrador?:number;
    idUsuario:number;
    tipoUsuario:'Cliente'|'Prestador';
    descricao:string;
    horarioInicio:Date;
    horarioFim?:Date;
    status:'Pendente'|'Em Andamento'|'Cancelado'|'Finalizado';
  constructor(
    id:number,
    idAdministrador:number|undefined,
    idUsuario:number,
    tipoUsuario:'Cliente'|'Prestador',
    descricao:string,
    horarioInicio:Date,
    horarioFim:Date|undefined,
    status:'Pendente'|'Em Andamento'|'Cancelado'|'Finalizado'
  ) {
    this.id = id;
    this.idAdministrador = idAdministrador;
    this.idUsuario = idUsuario;
    this.tipoUsuario = tipoUsuario
    this.descricao = descricao;
    this.horarioInicio = horarioInicio;
    this.horarioFim = horarioFim;
    this.status = status;
  }
}