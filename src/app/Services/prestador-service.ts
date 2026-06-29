import { inject, Injectable } from '@angular/core';
import { Prestador} from '../Modelos/prestador-modelo';
import { PrestadoresServicos } from 'src/TesteDatabase/Prestadores-Servicos';
import { Servico } from '../Modelos/servico-modelo';
import { UsuarioExclusao } from './exclusao-service';
import { Usuario } from '../Modelos/usuario-modelo';

@Injectable({
  providedIn: 'root',
})
export class prestadorService {
  private prestadores: Prestador[] = [];
  private exclusaoService: UsuarioExclusao = inject(UsuarioExclusao);

  constructor() {
    this.prestadores = PrestadoresServicos;
  }

  //Prestador

  public obterPrestadores() {
    return Object.freeze([...this.prestadores]);
  }
  public adicionar(usuario: Usuario):boolean {
    const tamanhoAnterior = this.prestadores.length;
    const prestador = new Prestador(
      usuario.id,
      usuario.CPF,
      usuario.Nome,
      usuario.Telefone,
      usuario.Email,
      usuario.Senha,
      '', // Descrição inicial vazia
      []  // Lista de serviços inicial vazia
    );
    if(this.verificarExistencia(usuario)){
      return false;
    }
    this.prestadores.push(prestador);
    if(tamanhoAnterior < this.prestadores.length){
        return true;
    }else {
        return false;
    }
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
    this.prestadores.splice(this.prestadores.indexOf(prestador), 1);
    return this.exclusaoService.excluir(usuarioExcluido);
  }
  public alterarDescricao(idPrestador: number, novaDescricao: string): boolean {
    const prestador = this.obterPrestadorPorId(idPrestador);
    if (prestador) {
      prestador.Descricao = novaDescricao;
      return true;
    }
    return false;
  }
  
  //Complementares
  public criarNovoID() { 
    let i = 1;
    for (let prestador of this.prestadores) {
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
    const prestador = this.prestadores.find((prestador) =>  prestador.CPF.split(/[.-]/).join('') === CPF); // 000.000.000.11 -> 00000000011
    return !!prestador; // Retorna true se o prestador existir, false caso contrário
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
        id: prestador.Servicos.length + 1, // Gerar um ID para o serviço
        nome,
        descricao,
        horarioInicio: horarioInicio,
        horarioFim: horarioFim
      };
      if(this.verificarServicoExistente(prestador.Servicos, novoServico)){
        return false;
      }
      prestador.Servicos.push(novoServico);
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
        return true;
      }
    }
    return false;
  }
  public obterServicos(): readonly Servico[] {
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
    return servicos.some(servico => servico.nome === novoServico.nome || servico.horarioInicio.getTime() === novoServico.horarioInicio.getTime() || servico.horarioFim.getTime() === novoServico.horarioFim.getTime());
  }
}
