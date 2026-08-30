import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Prestador} from '../Modelos/prestador-modelo';
import { PrestadoresServicos } from 'src/TesteDatabase/Prestadores-Servicos';
import { Servico } from '../Modelos/servico-modelo';
import { UsuarioExclusao } from './exclusao-service';
import { Usuario } from '../Modelos/usuario-modelo';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class prestadorService {
  private http = inject(HttpClient);
  private prestadores: Prestador[] = [];
  private exclusaoService: UsuarioExclusao = inject(UsuarioExclusao);
  private api = `${environment.api}/prestadores`; 

  constructor() {
    this.carregarPrestadores();
  }

  private carregarPrestadores() {
    this.http.get<Prestador[]>(this.api).subscribe({
      next: (dados) => {
        this.prestadores = dados.map(d => new Prestador(
          d.id,
          d.CPF,
          d.Nome,
          d.Telefone,
          d.Email,
          d.Senha,
          d.Descricao || '',
          d.Servicos || []
        ));
      },
      error: () => {
        // Fallback para dados locais se a API não estiver disponível
        this.prestadores = PrestadoresServicos;
      }
    });
  }

  //Prestador

  public obterPrestadores() {
    return Object.freeze([...this.prestadores]);
  }
  
  public adicionar(usuario: Usuario): boolean {
    const prestador = new Prestador(
      usuario.id,
      usuario.CPF,
      usuario.Nome,
      usuario.Telefone,
      usuario.Email,
      usuario.Senha,
      '',
      []
    );
    
    if(this.verificarExistencia(usuario)){
      return false;
    }
    
    // Criar no servidor
    this.http.post<Prestador>(this.api, {
      id: prestador.id,
      CPF: prestador.CPF,
      Nome: prestador.Nome,
      Telefone: prestador.Telefone,
      Email: prestador.Email,
      Senha: prestador.Senha,
      Descricao: prestador.Descricao,
      Servicos: prestador.Servicos,
      tipoUsuario: prestador.tipoUsuario
    }).subscribe({
      next: () => {
        this.prestadores.push(prestador);
      },
      error: () => {
        console.log('Erro ao adicionar prestador no servidor. Adicionando localmente.');
      }
    });
    
    return true;
  }
  
  public excluir(prestador: Prestador): boolean {
    const usuarioExcluido = {
      id: prestador.id,
      CPF: prestador.CPF,
      Nome: prestador.Nome,
      Telefone: prestador.Telefone,
      Email: prestador.Email,
      Senha: prestador.Senha,
      tipoUsuario: prestador.tipoUsuario,
      excluidoEm: new Date(), 
    };
    
    // Deletar do servidor
    this.http.delete(`${this.api}/${prestador.id}`).subscribe({
      next: () => {
        const index = this.prestadores.indexOf(prestador);
        if (index > -1) {
          this.prestadores.splice(index, 1);
        }
      },
      error: () => {
        console.error('Erro ao excluir prestador no servidor.');
      }
    });
    
    return this.exclusaoService.excluir(usuarioExcluido);
  }
  
  public alterarDescricao(idPrestador: number, novaDescricao: string): boolean {
    const prestador = this.obterPrestadorPorId(idPrestador);
    if (prestador) {
      prestador.Descricao = novaDescricao;
      
      // Atualizar no servidor
      this.http.patch(`${this.api}/${idPrestador}`, {//patch ao inves de PUT para atualizar parcialmente o prestador
        Descricao: novaDescricao
      }).subscribe();

      return true;
    }
    return false;
  }
  
  //Complementares
  public criarNovoID() { 
    let i = 1;
    for (let prestador of this.prestadores|| this.verificarExclusao(i, 'Prestador')) {
      if (i === prestador.id) {
        i++
      } else {
        return i;
      }
    }
    return i;
  }
  
  private verificarExistencia(usuario: Usuario):boolean{
    if(this.verificarCPF(usuario.CPF)){
        return true;
      }else if(this.verificarExclusao(usuario.id, 'Prestador')){
        return true;
      }
      return false;
  }
  
  public verificarCPF(CPF:string):boolean{
    const prestador = this.prestadores.find((prestador) =>  prestador.CPF.split(/[.-]/).join('') === CPF);
    return !!prestador;
  }
  
  private verificarExclusao(id: number, tipoUsuario:'Prestador'): boolean {
    return this.exclusaoService.verificarExclusao(id, tipoUsuario);
  }
  
  public obterPrestadorPorId(id: number) {
    return this.prestadores.find((prestador) => prestador.id === id);
  }
  
  public obterPrestadorPorNome(nome:string){
    return this.prestadores.find((prestador) =>  prestador.Nome.toLowerCase() === nome.toLocaleLowerCase());
  }

  //Serviços
  public cadastrarServico(idPrestador: number, nome: string, descricao: string, horarioInicio: Date, horarioFim: Date): boolean {
    const prestador = this.obterPrestadorPorId(idPrestador);
    if (prestador) {
      const novoServico: Servico = {
        id: prestador.Servicos.length + 1,
        nome: nome,
        descricao: descricao,
        horarioInicio: horarioInicio,
        horarioFim: horarioFim
      };
      
      if(this.verificarServicoExistente(prestador.Servicos, novoServico)){
        return false;
      }
      
      if(this.verificarHorarioSobreposto(prestador.Servicos, novoServico)){
        return false;
      }
      
      prestador.Servicos.push(novoServico);
      
      // Atualizar no servidor
      this.http.patch(`${this.api}/${idPrestador}`, {
        Servicos: prestador.Servicos
      }).subscribe();
      
      return true;
    }
    return false;
  }
  
  public removerServico(idPrestador: number, idServico: number): boolean {
    const prestador = this.obterPrestadorPorId(idPrestador);
    if (prestador) {
      const index = prestador.Servicos.findIndex(servico => servico.id === idServico);
      if (index !== -1) {
        prestador.Servicos.splice(index, 1);
        
        // Atualizar no servidor
        this.http.patch(`${this.api}/${idPrestador}`, {
          Servicos: prestador.Servicos
        }).subscribe();
        
        return true;
      }
    }
    return false;
  }
  
  public atualizarServico(idPrestador: number, idServico: number, nome: string, descricao: string, horarioInicio: Date, horarioFim: Date): boolean {
    const prestador = this.obterPrestadorPorId(idPrestador);
    if (prestador) {
      const servico = prestador.Servicos.find(servico => servico.id === idServico);
      if (servico) {
        servico.nome = nome;
        servico.descricao = descricao;
        servico.horarioInicio = horarioInicio;
        servico.horarioFim = horarioFim;
        
        // Atualizar no servidor
        this.http.patch(`${this.api}/${idPrestador}`, {
          Servicos: prestador.Servicos
        }).subscribe();
        
        return true;
      }
    }
    return false;
  }
  
  public obterServicos(): readonly Servico[] { //função em desuso, mas mantida para compatibilidade com o código existente
    const todosServicos: Servico[] = [];
    for (const prestador of this.prestadores) {
      todosServicos.push(...prestador.Servicos);
    }
    return Object.freeze(todosServicos);
  }
  
  public obterServicosDoPrestador(id: number): Servico[] | null {
    const prestador = this.obterPrestadorPorId(id);
    if (prestador) {
      return prestador.Servicos;
    }
    return null;
  }
  
  private verificarServicoExistente(servicos: Servico[], novoServico: Servico): boolean {
    return servicos.some(servico => servico.nome === novoServico.nome);
  }
  
  private verificarHorarioSobreposto(servicos: Servico[], novoServico: Servico): boolean {
    const novoInicio = novoServico.horarioInicio.getTime();
    const novoFim = novoServico.horarioFim.getTime();
    
    return servicos.some(servico => {
      const existenteInicio = servico.horarioInicio.getTime();
      const existenteFim = servico.horarioFim.getTime();
      
      return novoInicio < existenteFim && novoFim > existenteInicio;
    });
  }
  
  public validarHorarioSobreposto(idPrestador: number, horarioInicio: Date, horarioFim: Date): boolean {
    const prestador = this.obterPrestadorPorId(idPrestador);
    if (!prestador) {
      return false;
    }
    return this.verificarHorarioSobreposto(prestador.Servicos, {
      id: -1,
      nome: '',
      descricao: '',
      horarioInicio,
      horarioFim
    });
  }
}
