import { Component, inject } from '@angular/core';
import { IonHeader, IonButton, IonToolbar, IonTitle, IonContent } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { Prestador } from '../Modelos/prestador-modelo';
import { prestadorService } from '../Services/prestador-service';
import { agendamentoService } from '../Services/agendamento-service';
import { Servico } from '../Modelos/servico-modelo';
import { Cliente } from '../Modelos/cliente-modelo';
import { ToastController } from '@ionic/angular';
import { autenticacaoService } from '../Services/autenticacao-service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [IonHeader, IonButton, IonToolbar, IonTitle, IonContent],
})
export class HomePage { //Implementar clicar no card do prestador e ser levado a pagina de perfil do prestador
  //Implementar um gap entre o tempo permitido para um agendamento (ex: 1 hora)
  private prestadorService: prestadorService = inject(prestadorService);
  private agendamentoService: agendamentoService = inject(agendamentoService);
  protected prestadores: readonly Prestador[] = [];
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
  ionViewWillEnter() {
    this.prestadores = this.prestadorService.obterPrestadores();
  }
  async agendarServico(prestador: Prestador, servico: Servico) {
    if (!this.usuario || this.usuario.tipoUsuario !== 'Cliente') {
      await this.mostrarToast('Apenas clientes podem agendar serviços.');
      return;
    }

    const agendamento = {
      id:this.agendamentoService.obterAgendamentos().length + 1,
      idCliente: this.usuario.id,
      idPrestador: prestador.id,
      idServico: servico.id,
      horarioInicio: servico.horarioInicio,
      horarioFim: servico.horarioFim,
      status: "Pendente" as 'Pendente' | 'Confirmado' | 'Cancelado'
    };
    const sucesso = this.agendamentoService.adicionar(
      agendamento
    );
    console.log( `Agendamento ${sucesso ? 'realizado' : 'falhou'}:`, agendamento);
    if (sucesso) {
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

  goToPrestadorDashboard() {
    this.router.navigate(['/prestador']);
  }

  protected formatTime(horario: Date | string): string {
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
