import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Agendamento } from '../Modelos/agendamento-modelo';
import { prestadorService } from './prestador-service';
import { clienteService } from './cliente-service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class agendamentoService {
  private readonly intervaloMinimoMs = 60 * 60 * 1000;
  private http = inject(HttpClient);
  private prestadorService = inject(prestadorService);
  private clienteService = inject(clienteService);
  private api = `${environment.api}/agendamentos`;

  //________________________________________________________
  //CRUD Agendamentos
  public async obterAgendamentos(): Promise<Agendamento[]> {
    const dados = await firstValueFrom(this.http.get<Agendamento[]>(this.api));
    const agendamentos: Agendamento[] = [];
    dados.forEach((dado: Agendamento) => {
      agendamentos.push(this.criarAgendamento(dado));
    });
    return agendamentos;
  }

  public async adicionar(agendamento: Agendamento): Promise<boolean> {
    if (await this.verificarExistencia(agendamento)) {
      return false;
    }

    const agendamentoNormalizado = {
      ...agendamento,
      horarioInicio: new Date(agendamento.horarioInicio).toISOString(),
      horarioFim: new Date(agendamento.horarioFim).toISOString(),
    };

    try {
      await firstValueFrom(this.http.post<Agendamento>(this.api, agendamentoNormalizado));
      return true;
    } catch {
      return false;
    }
  }
  public async atualizarHorarios(agendamento: Agendamento): Promise<boolean> {
    const horarioNormalizado = {
      horarioInicio: new Date(agendamento.horarioInicio).toISOString(),
      horarioFim: new Date(agendamento.horarioFim).toISOString(),
    };
    try {
      await firstValueFrom(this.http.patch(`${this.api}/${agendamento.id}`, horarioNormalizado));
      return true;
    } catch {
      return false;
    }
  }

  public async atualizarStatus(id: number, status: Agendamento['status']): Promise<boolean> {
    try {
      await firstValueFrom(this.http.patch(`${this.api}/${id}`, { status }));
      return true;
    } catch {
      return false;
    }
  }

  public cancelarAgendamento(id: number): Promise<boolean> {
    return this.atualizarStatus(id, 'Cancelado');
  }

  //________________________________________________________
  //Pesquisadores
  public async obterAgendamentosPorCliente(idCliente: number): Promise<Agendamento[]> {
    const agendamentos = await this.obterAgendamentos();
    return agendamentos.filter(agendamento => agendamento.idCliente === idCliente);
  }

  public async obterAgendamentosPorPrestador(idPrestador: number): Promise<Agendamento[]> {
    const agendamentos = await this.obterAgendamentos();
    return agendamentos.filter(agendamento => agendamento.idPrestador === idPrestador);
  }

  public async obterAgendamentoDoServico(idCliente: number,idPrestador: number,idServico: number): Promise<Agendamento | undefined> {
    const agendamentos = await this.obterAgendamentos();
    const correspondentes = agendamentos.filter(agendamento => agendamento.idCliente === idCliente && agendamento.idPrestador === idPrestador && agendamento.idServico === idServico);
    return correspondentes.find(agendamento => agendamento.status !== 'Cancelado') ?? undefined;
  }

  //________________________________________________________
  //Verificadores e Validadores
  public async intervaloDisponivel(idPrestador: number,horarioInicio: Date | string,horarioFim: Date | string): Promise<boolean> {
    const inicio = new Date(horarioInicio).getTime();
    const fim = new Date(horarioFim).getTime();
    if (!inicio || !fim || fim <= inicio) {
      return false;
    }

    const agendamentos = await this.obterAgendamentos();
    return !agendamentos.some(agendamento => {
      if (agendamento.idPrestador !== idPrestador || agendamento.status === 'Cancelado') {
        return false;
      }

      const inicioExistente = new Date(agendamento.horarioInicio).getTime();
      const fimExistente = new Date(agendamento.horarioFim).getTime();
      return inicio < fimExistente + this.intervaloMinimoMs &&
        fim + this.intervaloMinimoMs > inicioExistente;
    });
  } 

  private async verificarExistencia(agendamento: Agendamento): Promise<boolean> {
    const [cliente, prestador, agendamentos] = await Promise.all([
      this.clienteService.obterClientePorId(agendamento.idCliente),
      this.prestadorService.obterPrestadorPorId(agendamento.idPrestador),
      this.obterAgendamentos(),
    ]); 

    if (!cliente || !prestador)
      return false;

    const agendamentoExistente = agendamentos.find((agen: Agendamento) =>
      agen.idCliente === agendamento.idCliente &&
      agen.idPrestador === agendamento.idPrestador &&
      agen.idServico === agendamento.idServico
    );
    return !!agendamentoExistente;
  }

  private criarAgendamento(dados: Agendamento): Agendamento {
    return new Agendamento(
      dados.id,
      dados.idCliente,
      dados.idPrestador,
      dados.idServico,
      new Date(dados.horarioInicio),
      new Date(dados.horarioFim),
      dados.status
    );
  }
}
