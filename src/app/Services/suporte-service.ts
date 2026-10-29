import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { prestadorService } from './prestador-service';
import { administradorService } from './administador-service';
import { clienteService } from './cliente-service';
import { environment } from 'src/environments/environment';
import { Suporte } from 'src/app/Modelos/suporte-modelo'

@Injectable({
  providedIn: 'root',
})

export class SuporteService {
  private http = inject(HttpClient);
  private prestadorService = inject(prestadorService);
  private clienteService = inject(clienteService);
  private administradorService = inject(administradorService);
  private api = `${environment.api}/suportes`;

  //________________________________________________________
  //CRUD Agendamentos
  public async obterSuportes(): Promise<Suporte[]>{
    const dados = await firstValueFrom(this.http.get<Suporte[]>(this.api));
    const suportes: Suporte[] = [];
    dados.forEach((dado:Suporte) => {
      suportes.push(this.criarSuporte(dado));
    });
    return suportes
  }

  public async solicitarSuporte(idUsuario: number,tipoUsuario: Suporte['tipoUsuario'],descricao: string): Promise<boolean> {
    //linha 73 serve para que confira se tipoUsuario é igual a Cliente e se for ele guarda na variavel o que a primeira parte
    //e caso não seja cliente ele só guarda a segunda
    const usuario = tipoUsuario === 'Cliente' ? await this.clienteService.obterClientePorId(idUsuario): await this.prestadorService.obterPrestadorPorId(idUsuario);

    if (!usuario || !descricao)
      return false;

    const dados = {
      id: await this.novoId(),
      idUsuario,
      tipoUsuario,
      descricao: descricao,
      horarioInicio: new Date(),
      status: 'Pendente' as const,
    };
    const novoSuporte:Suporte = this.criarSuporte(dados);

    try {
      await firstValueFrom(this.http.post<Suporte>(this.api, novoSuporte));
      return true;
    } catch (erro) {
      console.error('Erro ao solicitar suporte:', erro);
      return false;
    }
  }

  public async aceitarSuporte(idSuporte: number,idAdministrador: number): Promise<boolean> {
    const [suporte, administrador] = await Promise.all([
      this.obterSuportePorId(idSuporte),
      this.administradorService.obterAdministradorPorId(idAdministrador),
    ]);

    if (!suporte || suporte.status !== 'Pendente' || !administrador) {
      return false;
    }

    try {
      await firstValueFrom(this.http.patch(`${this.api}/${idSuporte}`, {
        idAdministrador,
        status: 'Em Andamento',
      }));
      return true;
    } catch (erro) {
      console.error('Erro ao aceitar suporte:', erro);
      return false;
    }
  }

  public async finalizarSuporte(idSuporte: number,idAdministrador: number): Promise<boolean> {
    const [suporte, administrador] = await Promise.all([
      this.obterSuportePorId(idSuporte),
      this.administradorService.obterAdministradorPorId(idAdministrador),
    ]);

    if (!suporte || !administrador) {
      return false;
    }

    try {
      await firstValueFrom(this.http.patch(`${this.api}/${idSuporte}`, {
        idAdministrador,
        status: 'Finalizado',
      }));
      return true;
    } catch (erro) {
      console.error('Erro ao aceitar suporte:', erro);
      return false;
    }
  }
  //________________________________________________________
  //Verificadores e Validadores

  
 
  //________________________________________________________
  //Pesquisadores
    public async obterSuportesPorUsuario(
    idUsuario: number,
    tipoUsuario: Suporte['tipoUsuario']
  ): Promise<Suporte[]> {
    const suportes = await this.obterSuportes();
    return suportes.filter(
      suporte => suporte.idUsuario === idUsuario &&
        suporte.tipoUsuario === tipoUsuario
    );
  }

  public async obterSuportesPendentes(): Promise<Suporte[]> {
    const suportes = await this.obterSuportes();
    return suportes.filter(suporte => suporte.status === 'Pendente');
  }
  public async obterSuportesFinalizados(): Promise<Suporte[]> {
    const suportes = await this.obterSuportes();
    return suportes.filter(suporte => suporte.status === 'Finalizado');
  }

  public async obterSuportePorId(id: number): Promise<Suporte | undefined> {
    const suportes = await this.obterSuportes();
    return suportes.find(suporte => suporte.id === id);
  }
  //________________________________________________________
  //Complementares
   private criarSuporte(dados: Suporte): Suporte {
    return new Suporte(
      dados.id,
      dados.idAdministrador ? dados.idAdministrador: undefined,
      dados.idUsuario,
      dados.tipoUsuario,
      dados.descricao,
      new Date(dados.horarioInicio),
      dados.horarioFim ? new Date(dados.horarioFim) : undefined,
      dados.status
    );
  }
  private async novoId(): Promise<number> {
    const suportes = await this.obterSuportes();
    const ids: number[] = [];
    suportes.forEach((suporte:Suporte) => {
      ids.push(suporte.id);
    });
    if (ids.length === 0) {
      return -1;
    }
    return Math.max(...ids) + 1;
  }
}

