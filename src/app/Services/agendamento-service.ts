import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Servico } from '../Modelos/servico-modelo';
import { prestadorService } from './prestador-service';
import { clienteService } from './cliente-service';
import { Agendamento } from '../Modelos/agendamento-modelo';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class agendamentoService {
  private http = inject(HttpClient);
  private Agendamentos: Agendamento[] = [];
  private prestadorService: prestadorService = inject(prestadorService);
  private clienteService: clienteService = inject(clienteService);
  private api = `${environment.api}/agendamentos`;

  constructor() {
    this.carregarAgendamentos();
  }

  private carregarAgendamentos() {
    this.http.get<Agendamento[]>(this.api).subscribe({
      next: (dados) => {
        this.Agendamentos = dados.map(d => new Agendamento(
          d.id,
          d.idCliente,
          d.idPrestador,
          d.idServico,
          new Date(d.horarioInicio),
          new Date(d.horarioFim),
          d.status
        ));
      },
      error: () => {
        // Fallback para dados vazios se a API não estiver disponível
        this.Agendamentos = [];
      }
    });
  }

  public obterAgendamentos(): Agendamento[] {
    return [...this.Agendamentos];
  }

  public obterAgendamentosPorCliente(idCliente: number): Agendamento[] {
    return this.Agendamentos.filter((agendamento) => agendamento.idCliente === idCliente);
  }

  public obterAgendamentosPorPrestador(idPrestador: number): Agendamento[] {
    return this.Agendamentos.filter((agendamento) => agendamento.idPrestador === idPrestador);
  }

  public adicionar(agendamento: Agendamento): boolean {
    const novoAgendamento = new Agendamento(
      agendamento.id,
      agendamento.idCliente,
      agendamento.idPrestador,
      agendamento.idServico,
      agendamento.horarioInicio,
      agendamento.horarioFim,
      agendamento.status,
    );

    if (this.verificarExistencia(novoAgendamento)) {
      return false;
    }

    // Criar no servidor
    this.http.post<Agendamento>(this.api, {
      id: novoAgendamento.id,
      idCliente: novoAgendamento.idCliente,
      idPrestador: novoAgendamento.idPrestador,
      idServico: novoAgendamento.idServico,
      horarioInicio: novoAgendamento.horarioInicio.toISOString(),
      horarioFim: novoAgendamento.horarioFim.toISOString(),
      status: novoAgendamento.status
    }).subscribe({
      next: () => {
        this.Agendamentos.push(novoAgendamento);
      },
      error: () => {
        this.Agendamentos.push(novoAgendamento);
      }
    });

    return true;
  }

  public atualizarStatus(id: number, status: Agendamento['status']): boolean {
    const agendamento = this.Agendamentos.find((item) => item.id === id);
    if (!agendamento) {
      return false;
    }

    agendamento.status = status;
    
    // Atualizar no servidor
    this.http.patch(`${this.api}/${id}`, {
      status: status
    }).subscribe();

    return true;
  }

  public cancelarAgendamento(id: number): boolean {
    return this.atualizarStatus(id, 'Cancelado');
  }

  private verificarExistencia(agendamento: Agendamento): boolean {
    for (const item of this.Agendamentos) {
      if (!this.clienteService.obterClientePorId(agendamento.idCliente)?.id) {
        return true;
      }

      if (!this.prestadorService.obterPrestadorPorId(agendamento.idPrestador)?.id) {
        return true;
      }

      if (
        item.idServico === agendamento.idServico &&
        item.idPrestador === agendamento.idPrestador &&
        item.idCliente === agendamento.idCliente
      ) {
        return true;
      }
    }

    return false;
  }
}
