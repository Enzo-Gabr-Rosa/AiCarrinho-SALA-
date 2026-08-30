import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { IonButton, IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { Agendamento } from '../Modelos/agendamento-modelo';
import { Prestador } from '../Modelos/prestador-modelo';
import { Servico } from '../Modelos/servico-modelo';
import { agendamentoService } from '../Services/agendamento-service';
import { autenticacaoService } from '../Services/autenticacao-service';
import { prestadorService } from '../Services/prestador-service';

@Component({
  selector: 'app-agendamentos',
  templateUrl: './agendamentos.page.html',
  styleUrls: ['./agendamentos.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, IonButton, CommonModule],
})
export class AgendamentosPage {
  private router = inject(Router);
  private autenticacaoService = inject(autenticacaoService);
  private agendamentoService = inject(agendamentoService);
  private prestadorService = inject(prestadorService);

  protected usuario: { id: number; Nome: string; tipoUsuario: 'Cliente' | 'Prestador' | 'Administrador' } | null = null;
  protected agendamentos: Agendamento[] = [];

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
      return;
    }

    if (this.usuario.tipoUsuario === 'Prestador') {
      this.agendamentos = this.agendamentoService.obterAgendamentosPorPrestador(this.usuario.id);
      return;
    }

    this.agendamentos = this.agendamentoService.obterAgendamentos();
  }
}
