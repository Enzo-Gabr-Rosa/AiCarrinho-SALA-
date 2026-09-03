import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { IonButton, IonContent, IonHeader, IonTitle, IonToolbar, IonModal, IonButtons, IonInput } from '@ionic/angular/standalone';
import { Agendamento } from '../Modelos/agendamento-modelo';
import { Prestador } from '../Modelos/prestador-modelo';
import { Servico } from '../Modelos/servico-modelo';
import { agendamentoService } from '../Services/agendamento-service';
import { autenticacaoService } from '../Services/autenticacao-service';
import { prestadorService } from '../Services/prestador-service';
import { Usuario } from '../Modelos/usuario-modelo';


@Component({
  selector: 'app-agendamentos',
  templateUrl: './agendamentos.page.html',
  styleUrls: ['./agendamentos.page.scss'],
  standalone: true,
  imports: [IonInput, IonButtons, IonModal, IonContent, IonHeader, IonTitle, IonToolbar, IonButton, CommonModule],
})
export class AgendamentosPage {
  private router = inject(Router);
  private autenticacaoService = inject(autenticacaoService);
  private agendamentoService = inject(agendamentoService);
  private prestadorService = inject(prestadorService);
  protected estaAberto = false;
  protected usuarioEdicao: Partial<Usuario> = {};
  protected usuario: { id: number; Nome: string; tipoUsuario: 'Cliente' | 'Prestador' | 'Administrador' } | null = null;
  protected agendamentos: Agendamento[] = [];
  protected tipoUsuario = 'Usuário';

  constructor() {
    this.usuario = this.autenticacaoService.obterUsuarioAtual();
    if (!this.usuario) {
      this.router.navigate(['/login']);
      return;
    }

    this.carregarAgendamentos();
  }

  ionViewWillEnter() {
    this.carregarAgendamentos();
  }

  protected voltarParaHome() {
    this.router.navigate(['/home']);
  }

  protected voltarParaPerfil() {
    this.router.navigate(['/perfil']);
  }

  protected cancelarAgendamento(id: number) {
    const cancelado = this.agendamentoService.cancelarAgendamento(id);
    if (cancelado) {
      this.carregarAgendamentos();
    }
  }
  protected cadastrarServico() {
    // this.router.navigate(['/prestador']);//
    this.setOpen(false);
  }

  protected getPrestadorPorId(idPrestador: number): Prestador | undefined {
    return this.prestadorService.obterPrestadorPorId(idPrestador);
  }

  protected getServicoDoPrestador(idPrestador: number, idServico: number): Servico | undefined {
    const prestador = this.getPrestadorPorId(idPrestador);
    return prestador?.Servicos.find((servico) => servico.id === idServico);
  }

  protected formatDate(data: Date | string): string {
    const value = new Date(data);
    return `${String(value.getDate()).padStart(2, '0')}/${String(value.getMonth() + 1).padStart(2, '0')}/${value.getFullYear()} ${String(value.getHours()).padStart(2, '0')}:${String(value.getMinutes()).padStart(2, '0')}`;
  }

  private carregarAgendamentos() {
    if (!this.usuario) {
      this.agendamentos = [];
      return;
    }

    if (this.usuario.tipoUsuario === 'Cliente') {
      this.agendamentos = this.agendamentoService.obterAgendamentosPorCliente(this.usuario.id);
      console.log()
      return;
    }

    if (this.usuario.tipoUsuario === 'Prestador') {
      this.agendamentos = this.agendamentoService.obterAgendamentosPorPrestador(this.usuario.id);
      return;
    }

    this.agendamentos = this.agendamentoService.obterAgendamentos();
  }
  
  setOpen(isOpen: boolean) {
    this.estaAberto = isOpen;
    if (isOpen && this.usuario) {
      this.usuarioEdicao = { ...this.usuario };
    }
  }
}
