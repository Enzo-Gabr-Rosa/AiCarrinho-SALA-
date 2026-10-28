import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { cpf } from 'cpf-cnpj-validator';
import { Prestador } from '../Modelos/prestador-modelo';
import { Servico } from '../Modelos/servico-modelo';
import { Usuario } from '../Modelos/usuario-modelo';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class prestadorService {
  private http = inject(HttpClient);
  private api = `${environment.api}/prestadores`;

  //________________________________________________________
  //CRUD Prestadores
  public async obterPrestadores(): Promise<Prestador[]> {
    const dados = await firstValueFrom(this.http.get<Prestador[]>(this.api)); //firtValueFrom para converter o Observable em Promise
    const prestadores: Prestador[] = [];
    dados.forEach((prestador: Prestador) => {
      prestadores.push(this.criarPrestador(prestador));
    });
    return prestadores;
  }

  public async adicionar(usuario: Usuario): Promise<Prestador | null> {
    const prestador = new Prestador(
      await this.novoId(),
      usuario.CPF,
      usuario.Nome,
      usuario.Telefone,
      usuario.Email,
      usuario.Senha,
      '',
      []
    );

    try {
      if (await this.verificarCPF(usuario.CPF)) {
        return null;
      }

      const criado = await firstValueFrom(this.http.post<Prestador>(this.api, {
        id: prestador.id,
        CPF: prestador.CPF,
        Nome: prestador.Nome,
        Telefone: prestador.Telefone,
        Email: prestador.Email,
        Senha: prestador.Senha,
        Descricao: prestador.Descricao,
        Servicos: prestador.Servicos,
      }));
      return this.criarPrestador(criado);
    } catch {
      return null;
    }
  }

  public async alterarDados(
    id: number,
    dados: Partial<Pick<Prestador, 'Nome' | 'CPF' | 'Telefone' | 'Senha' | 'Descricao'>> & { Email?: string | null }
  ): Promise<boolean> {
    try {
      await firstValueFrom(this.http.patch(`${this.api}/${id}`, dados));
      return true;
    } catch (erro) {
      console.error('Erro ao alterar dados do prestador:', erro);
      return false;
    }
  }


  public async excluir(prestador: Prestador): Promise<boolean> {
    try {
      await firstValueFrom(this.http.delete(`${this.api}/${prestador.id}`));
      return true;
    } catch {
      return false;
    }
  }

  public async alterarDescricao(idPrestador: number, novaDescricao: string): Promise<boolean> {
    try {
      await firstValueFrom(this.http.patch(`${this.api}/${idPrestador}`, { Descricao: novaDescricao }));
      return true;
    } catch {
      return false;
    }
  }

  //________________________________________________________
  //Pesquisadores
  public async obterPrestadorPorId(id: number): Promise<Prestador | undefined> {
    const prestadores = await this.obterPrestadores();
    return prestadores.find(prestador => prestador.id === id);
  }

  public async obterPrestadorPorNome(nome: string): Promise<Prestador | undefined> {
    const prestadores = await this.obterPrestadores();
    return prestadores.find(prestador => prestador.Nome.toLocaleLowerCase() === nome.toLocaleLowerCase());
  }
  public async obterPrestadorPorCPF(cpfInformado: string): Promise<Prestador | undefined> {
    const cpfNormalizado = cpf.strip(cpfInformado);
    const prestadores = await this.obterPrestadores();
    return prestadores.find(prestador => cpf.strip(prestador.CPF) === cpfNormalizado);
  }
  public async obterServicosDoPrestador(id: number): Promise<Servico[] | null> {
    const prestador = await this.obterPrestadorPorId(id);
    if (!prestador)
      return null;
    return prestador.Servicos ?? null;
  }

  //________________________________________________________
  //CRUD Serviços
  public async cadastrarServico(
    idPrestador: number,
    nome: string,
    descricao: string,
    horarioInicio: Date,
    horarioFim: Date
  ): Promise<boolean> {
    const prestador = await this.obterPrestadorPorId(idPrestador);
    if (!prestador) {
      return false;
    }

    const novoServico: Servico = {
      id: Math.max(0, ...prestador.Servicos.map(servico => servico.id)) + 1,
      nome,
      descricao,
      horarioInicio,
      horarioFim,
    };

    if (this.verificarServicoExistente(prestador.Servicos, novoServico) ||
      this.verificarHorarioSobreposto(prestador.Servicos, novoServico)) {
      return false;
    }

    await firstValueFrom(this.http.patch(`${this.api}/${idPrestador}`, {
      Servicos: [...prestador.Servicos, novoServico],
    }));
    return true;
  }

  public async removerServico(idPrestador: number, idServico: number): Promise<boolean> {
    const prestador = await this.obterPrestadorPorId(idPrestador);
    if (!prestador) {
      return false;
    }

    const servicos = prestador.Servicos.filter(servico => servico.id !== idServico);
    if (servicos.length === prestador.Servicos.length) {
      return false;
    }

    await firstValueFrom(this.http.patch(`${this.api}/${idPrestador}`, { Servicos: servicos }));
    return true;
  }

  public async atualizarServico(
    idPrestador: number,
    idServico: number,
    nome: string,
    descricao: string,
    horarioInicio: Date,
    horarioFim: Date
  ): Promise<boolean> {
    const prestador = await this.obterPrestadorPorId(idPrestador);
    if (!prestador || !prestador.Servicos.some(servico => servico.id === idServico)) {
      return false;
    }

    const servicos = prestador.Servicos.map(servico => servico.id === idServico
      ? { ...servico, nome, descricao, horarioInicio, horarioFim }
      : servico);
    await firstValueFrom(this.http.patch(`${this.api}/${idPrestador}`, { Servicos: servicos }));
    return true;
  }

  public async obterServicos(): Promise<Servico[]> {
    const prestadores = await this.obterPrestadores();
    const servicos: Servico[] = [];
    prestadores.forEach(prestador => {
      prestador.Servicos.forEach(servico => {
        servicos.push({ ...servico });
      });
    });
    return servicos;
  }



  //________________________________________________________
  //Verificadores e Validadores
  public async verificarCPF(cpfInformado: string): Promise<boolean> {
    const cpfNormalizado = cpf.strip(cpfInformado); //strip para remover caracteres não numéricos do CPF informado
    const prestadores = await this.obterPrestadores();
    return prestadores.some(prestador => cpf.strip(prestador.CPF) === cpfNormalizado);
  }

  public async validarHorarioSobreposto(idPrestador: number, horarioInicio: Date, horarioFim: Date): Promise<boolean> {
    const prestador = await this.obterPrestadorPorId(idPrestador);
    if (!prestador) {
      return false;
    }

    return this.verificarHorarioSobreposto(prestador.Servicos, {
      id: -1,
      nome: '',
      descricao: '',
      horarioInicio,
      horarioFim,
    });
  }

  private verificarServicoExistente(servicos: Servico[], novoServico: Servico): boolean {
    return servicos.some(servico => servico.nome === novoServico.nome);
  }

  private verificarHorarioSobreposto(servicos: Servico[], novoServico: Servico): boolean {
    const novoInicio = novoServico.horarioInicio.getTime();
    const novoFim = novoServico.horarioFim.getTime();
    return servicos.some(servico =>
      novoInicio < new Date(servico.horarioFim).getTime() &&
      novoFim > new Date(servico.horarioInicio).getTime()
    );
  }


  //________________________________________________________
  //Complementares
  private criarPrestador(dados: Prestador): Prestador {
    return new Prestador(
      dados.id,
      dados.CPF,
      dados.Nome,
      dados.Telefone,
      dados.Email,
      dados.Senha,
      dados.Descricao || '',
      dados.Servicos || []
    );
  }

  private async novoId(): Promise<number> {
    const prestadores = await this.obterPrestadores();
    const ids: number[] = [];
    prestadores.forEach(prestador => {
      ids.push(prestador.id);
    });
    if (ids.length === 0) {
      return -1;
    }
    return Math.max(...ids) + 1;
  }
}
