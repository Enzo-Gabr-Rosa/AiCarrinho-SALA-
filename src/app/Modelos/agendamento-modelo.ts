export class Agendamento {
    id:number;
    idCliente:number;
    idPrestador:number;
    idServico:number;
    horarioInicio:Date;
    horarioFim:Date;
    status:'Pendente'|'Confirmado'|'Cancelado';
  constructor(
    id:number,
    idCliente:number,
    idPrestador:number,
    idServico:number,
    horarioInicio:Date,
    horarioFim:Date,
    status:'Pendente'|'Confirmado'|'Cancelado'
  ) {
    this.id = id;
    this.idCliente = idCliente;
    this.idPrestador = idPrestador;
    this.idServico = idServico;
    this.horarioInicio = horarioInicio;
    this.horarioFim = horarioFim;
    this.status = status;
  }
}