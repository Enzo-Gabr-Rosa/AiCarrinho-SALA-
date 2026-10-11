import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonInput } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { Prestador } from '../Modelos/prestador-modelo';
import { prestadorService } from '../Services/prestador-service';
import { agendamentoService } from '../Services/agendamento-service';
import { Servico } from '../Modelos/servico-modelo';
import { Cliente } from '../Modelos/cliente-modelo';
import { Agendamento } from '../Modelos/agendamento-modelo';
import { ToastController } from '@ionic/angular';
import { autenticacaoService } from '../Services/autenticacao-service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonInput, FormsModule],
})
export class HomePage {
  private prestadorService: prestadorService = inject(prestadorService);
  private agendamentoService: agendamentoService = inject(agendamentoService);
  protected prestadores: readonly Prestador[] = [];
  protected agendamentos: readonly Agendamento[] = [];
  protected termoBusca = '';
  private router = inject(Router);
  private toastController = inject(ToastController);
  private autenticacaoService = inject(autenticacaoService);
  protected usuario: Cliente | null = null;

  constructor() {
    this.usuario = this.autenticacaoService.obterUsuarioAtual() as Cliente | null;
    if (!this.usuario) {
      this.router.navigate(['/login']);
    }
  }
  async ionViewWillEnter() {
    [this.prestadores, this.agendamentos] = await Promise.all([
      this.prestadorService.obterPrestadores(),
      this.agendamentoService.obterAgendamentos()
    ]);
  }

  protected filtrarPrestadores(): readonly Prestador[] {
    const termo = this.normalizarBusca(this.termoBusca);
    if (!termo) {
      return this.prestadores;
    }

    return this.prestadores.filter((prestador) => {
      const dadosPrestador = this.normalizarBusca(`${prestador.Nome} ${prestador.Descricao}`);
      return dadosPrestador.includes(termo) ||
        prestador.Servicos.some((servico) =>
          this.normalizarBusca(`${servico.nome} ${servico.descricao}`).includes(termo)
        );
    });
  }

  protected servicosFiltrados(prestador: Prestador): readonly Servico[] {
    const termo = this.normalizarBusca(this.termoBusca);
    if (!termo) {
      return prestador.Servicos;
    }

    const dadosPrestador = this.normalizarBusca(`${prestador.Nome} ${prestador.Descricao}`);
    if (dadosPrestador.includes(termo)) {
      return prestador.Servicos;
    }

    return prestador.Servicos.filter((servico) =>
      this.normalizarBusca(`${servico.nome} ${servico.descricao}`).includes(termo)
    );
  }

  private normalizarBusca(valor: string): string {
    // Separa letras de seus acentos, remove as marcas, converte para minúsculas e tira espaços das extremidades para comparar buscas sem depender de acentuação ou caixa.
    return valor.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase().trim();
  }

  async agendarServico(prestador: Prestador, servico: Servico) {
    if (!this.usuario || this.usuario.tipoUsuario !== 'Cliente') {
      await this.mostrarToast('Apenas clientes podem agendar serviços.');
      return;
    }

    if (!await this.agendamentoService.intervaloDisponivel(
      prestador.id,
      servico.horarioInicio,
      servico.horarioFim
    )) {
      await this.mostrarToast('Este horário precisa ter pelo menos 1 hora de intervalo de outro agendamento.');
      return;
    }

    const agendamento = {
      id: Math.max(0, ...this.agendamentos.map(item => Number(item.id)).filter(Number.isFinite)) + 1,
      idCliente: this.usuario.id,
      idPrestador: prestador.id,
      idServico: servico.id,
      horarioInicio: servico.horarioInicio,
      horarioFim: servico.horarioFim,
      status: "Pendente" as 'Pendente' | 'Confirmado' | 'Cancelado'
    };
    const sucesso = await this.agendamentoService.adicionar(agendamento);
    console.log( `Agendamento ${sucesso ? 'realizado' : 'falhou'}:`, agendamento);
    if (sucesso) {
      this.agendamentos = await this.agendamentoService.obterAgendamentos();
      await this.mostrarToast('Agendamento realizado com sucesso!');
    } else {
      await this.mostrarToast('Falha ao realizar o agendamento. Por favor, tente novamente.');
    }
  }

  goToPerfil() {
    this.router.navigate(['/perfil']);
  }

  goToAgendamentos() {
    this.router.navigate(['/agendamentos']);
  }

  goToPrestador(prestador: Prestador) {
    this.router.navigate(['/prestador', prestador.id]);
  }

  protected agendamentoDoServico(prestador: Prestador, servico: Servico) {
    if (!this.usuario) {
      return undefined;
    }

    const correspondentes = this.agendamentos.filter(agendamento =>
      String(agendamento.idCliente) === String(this.usuario?.id) &&
      String(agendamento.idPrestador) === String(prestador.id) &&
      agendamento.idServico === servico.id
    );
    return correspondentes.find(agendamento => agendamento.status !== 'Cancelado') ??
      correspondentes[correspondentes.length - 1];
  }

  protected textoBotaoAgendamento(prestador: Prestador, servico: Servico): string {
    const agendamento = this.agendamentoDoServico(prestador, servico);
    if (!agendamento) {
      return 'Agendar Serviço';
    }
    return agendamento.status === 'Cancelado' ? 'Cancelado' : 'Agendado';
  }

  protected agendamentoJaExiste(prestador: Prestador, servico: Servico): boolean {
    const agendamento = this.agendamentoDoServico(prestador, servico);
    return Boolean(agendamento && agendamento.status !== 'Cancelado');
  }

  protected formatDate(horario: Date | string): string {
    const data = new Date(horario);
    return `${String(data.getDate()).padStart(2, '0')}/${String(data.getMonth() + 1).padStart(2, '0')}/${data.getFullYear()} ${String(data.getHours()).padStart(2, '0')}:${String(data.getMinutes()).padStart(2, '0')}`;
  }
  private async mostrarToast(mensagem: string) {
    const toast = await this.toastController.create({
      message: mensagem,
      duration: 2500,
      position: 'bottom',
      color: 'primary'
    });

    await toast.present();
  }
}
