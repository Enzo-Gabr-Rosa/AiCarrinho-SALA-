import { inject, Injectable } from '@angular/core';
import { Servico } from '../Modelos/servico-modelo';
import { prestadorService } from './prestador-service';
import { clienteService } from './cliente-service';
import { Agendamento } from '../Modelos/agendamento-modelo';

@Injectable({
  providedIn: 'root',
})
export class agendamentoService {
  private Agendamentos: Agendamento[] = [];
  private prestadorService: prestadorService = inject(prestadorService);
  private clienteService: clienteService = inject(clienteService);

  constructor(){}
  public obterAgendamentos() {
    return Object.freeze([...this.Agendamentos]);
  }
  public adicionar(agendamento: Agendamento): boolean {
    const tamanhoAnterior = this.Agendamentos.length;
    console.log(tamanhoAnterior);
    const novoAgendamento = new Agendamento(
      agendamento.id,
      agendamento.idCliente,
      agendamento.idPrestador,
      agendamento.idServico,
      agendamento.horarioInicio,
      agendamento.horarioFim,
      agendamento.status);
      if(this.verificarExistencia(novoAgendamento)){
        return false;
      }
      console.log(novoAgendamento);
      this.Agendamentos.push(novoAgendamento);
      if(tamanhoAnterior < this.Agendamentos.length){
        return true;
      }else {
        return false;
      }
  }


  private verificarExistencia(agendamento: Agendamento): boolean {
    for (const item of this.Agendamentos) {
      if(!this.clienteService.obterClientePorId(agendamento.idCliente)?.id){
        return true;
      }else if(!this.prestadorService.obterPrestadorPorId(agendamento.idPrestador)?.id){
        return true;
      }else if(item.idServico === agendamento.idServico && item.idPrestador === agendamento.idPrestador && item.idCliente === agendamento.idCliente){
        return true;
      }
    }
    return false;
  }

}
