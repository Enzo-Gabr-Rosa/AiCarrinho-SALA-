import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  IonButton,
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { Prestador } from '../Modelos/prestador-modelo';
import { Servico } from '../Modelos/servico-modelo';
import { autenticacaoService } from '../Services/autenticacao-service';
import { prestadorService } from '../Services/prestador-service';

@Component({
  selector: 'app-prestador',
  templateUrl: './prestador.page.html',
  styleUrls: ['./prestador.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, IonButton, CommonModule, FormsModule],
})
export class PrestadorPage {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private autenticacaoService = inject(autenticacaoService);
  private prestadorService = inject(prestadorService);

  protected prestador: Prestador | null = null;
  protected somenteLeitura = false;
  protected mensagemErro = '';
  protected novoServico: {
    nome: string;
    descricao: string;
    horarioInicio: string;
    horarioFim: string;
  } = {
    nome: '',
    descricao: '',
    horarioInicio: '',
    horarioFim: '',
  };

  constructor() {
    void this.carregarPerfil();
  }

  async ionViewWillEnter() {
    await this.carregarPerfil();
  }

  private async carregarPerfil() {
    this.mensagemErro = '';
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.somenteLeitura = true;
      this.prestador = await this.prestadorService.obterPrestadorPorId(Number(idParam)) ?? null;
      if (!this.prestador) {
        this.mensagemErro = 'Prestador não encontrado.';
      }
      return;
    }

    this.somenteLeitura = false;
    this.prestador = this.autenticacaoService.obterUsuarioAtual() as Prestador | null;
    if (!this.prestador || this.prestador.tipoUsuario !== 'Prestador') {
      this.router.navigate(['/login']);
    }
  }

  protected voltarParaHome() {
    this.router.navigate(['/home']);
  }

  protected voltarParaPerfil() {
    this.router.navigate(['/perfil']);
  }

  protected async cadastrarServico() {
    this.mensagemErro = '';
    if (!this.prestador) 
      return;

    const nome = this.novoServico.nome?.trim();
    const descricao = this.novoServico.descricao?.trim() ?? '';
    const horarioInicioRaw = this.novoServico.horarioInicio;
    const horarioFimRaw = this.novoServico.horarioFim;

    if (!nome || !horarioInicioRaw || !horarioFimRaw) {
      this.mensagemErro = 'Preencha todos os campos obrigatórios.';
      return;
    }

    const horarioInicio = new Date(horarioInicioRaw);
    const horarioFim = new Date(horarioFimRaw);

    if (Number.isNaN(horarioInicio.getTime()) || Number.isNaN(horarioFim.getTime())) {
      this.mensagemErro = 'Horários inválidos.';
      return;
    }

    if (horarioFim <= horarioInicio) {
      this.mensagemErro = 'Horário de término deve ser posterior ao de início.';
      return;
    }

    if (await this.prestadorService.validarHorarioSobreposto(this.prestador.id, horarioInicio, horarioFim)) {
      this.mensagemErro = 'Este serviço se sobrepõe com outro horário já cadastrado.';
      return;
    }

    const sucesso = await this.prestadorService.cadastrarServico(
      this.prestador.id,
      nome,
      descricao,
      horarioInicio,
      horarioFim,
    );

    if (sucesso) {
      this.novoServico = {
        nome: '',
        descricao: '',
        horarioInicio: '',
        horarioFim: '',
      };
      this.prestador = await this.prestadorService.obterPrestadorPorId(this.prestador.id) ?? this.prestador;
    } else {
      this.mensagemErro = 'Erro ao cadastrar serviço. Verifique se o nome já existe.';
    }
  }

  protected async removerServico(idServico: number) {
    if (!this.prestador) {
      return;
    }

    const removido = await this.prestadorService.removerServico(this.prestador.id, idServico);
    if (removido) {
      this.prestador = await this.prestadorService.obterPrestadorPorId(this.prestador.id) ?? this.prestador;
    }
  }

  protected formatDate(data: Date | string): string {
    const value = new Date(data);
    // Formata a data no formato DD/MM/YYYY HH:mm adicionando zeros à esquerda quando necessário
    return `${String(value.getDate()).padStart(2, '0')}/${String(value.getMonth() + 1).padStart(2, '0')}/${value.getFullYear()} ${String(value.getHours()).padStart(2, '0')}:${String(value.getMinutes()).padStart(2, '0')}`;
  }
}
