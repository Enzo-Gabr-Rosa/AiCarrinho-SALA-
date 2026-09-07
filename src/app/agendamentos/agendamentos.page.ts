import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { IonButton, IonContent, IonHeader, IonTitle, IonToolbar, IonModal, IonButtons, IonInput } from '@ionic/angular/standalone';
import { ToastController } from '@ionic/angular';
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
  imports: [IonInput, IonButtons, IonModal, IonContent, IonHeader, IonTitle, IonToolbar, IonButton, CommonModule, ReactiveFormsModule],
})
export class AgendamentosPage {
  private router = inject(Router);
  private autenticacaoService = inject(autenticacaoService);
  private agendamentoService = inject(agendamentoService);
  private prestadorService = inject(prestadorService);
  private formBuilder = inject(NonNullableFormBuilder);
  private toastController = inject(ToastController);
  protected estaAberto = false;
  protected usuarioEdicao: Partial<Usuario> = {};
  protected usuario: { id: number; Nome: string; tipoUsuario: 'Cliente' | 'Prestador' | 'Administrador' } | null = null;
  protected agendamentos: Agendamento[] = [];
  protected tipoUsuario = 'Usuário';
  protected servicoForm = this.formBuilder.group({
    nome: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
    descricao: ['', [Validators.maxLength(500)]],
    horarioInicio: ['', Validators.required],
    horarioFim: ['', Validators.required],
  });

  constructor() {
    this.usuario = this.autenticacaoService.obterUsuarioAtual();
    if (!this.usuario) {
      this.router.navigate(['/login']);
      return;
    }

    this.tipoUsuario = this.usuario.tipoUsuario;
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
  protected async cadastrarServico() {
    if (!this.usuario || this.usuario.tipoUsuario !== 'Prestador') {
      await this.mostrarToast('Apenas prestadores podem cadastrar serviços.', 'danger');
      return;
    }

    if (this.servicoForm.invalid) {
      await this.mostrarToast('Preencha os campos obrigatórios corretamente.', 'danger');
      return;
    }

    const { nome, descricao, horarioInicio, horarioFim } = this.servicoForm.getRawValue();
    const inicio = new Date(horarioInicio);
    const fim = new Date(horarioFim);

    if (Number.isNaN(inicio.getTime()) || Number.isNaN(fim.getTime()) || fim <= inicio) {
      await this.mostrarToast('O horário de término deve ser posterior ao horário de início.', 'danger');
      return;
    }

    if (this.prestadorService.validarHorarioSobreposto(this.usuario.id, inicio, fim)) {
      await this.mostrarToast('Este serviço se sobrepõe a outro horário já cadastrado.', 'danger');
      return;
    }

    const cadastrado = this.prestadorService.cadastrarServico(
      this.usuario.id,
      nome.trim(),
      descricao.trim(),
      inicio,
      fim,
    );

    if (!cadastrado) {
      await this.mostrarToast('Não foi possível cadastrar o serviço. Verifique se o nome já existe.', 'danger');
      return;
    }

    this.servicoForm.reset();
    this.setOpen(false);
    await this.mostrarToast('Serviço cadastrado com sucesso.', 'success');
  }

  private async mostrarToast(mensagem: string, color: 'danger' | 'success') {
    const toast = await this.toastController.create({
      message: mensagem,
      duration: 2500,
      position: 'bottom',
      color,
    });
    await toast.present();
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
