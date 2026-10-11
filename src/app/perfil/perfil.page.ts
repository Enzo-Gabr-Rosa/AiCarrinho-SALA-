import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonContent, IonInput, IonHeader, IonButtons, IonModal, IonButton, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { ToastController } from '@ionic/angular';
import { Usuario } from '../Modelos/usuario-modelo';
import { clienteService } from '../Services/cliente-service';
import { prestadorService } from '../Services/prestador-service';
import { administradorService } from '../Services/administador-service';
import { autenticacaoService } from '../Services/autenticacao-service';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss'],
  standalone: true,
  imports: [IonContent, IonInput, IonHeader, IonButtons, IonModal, IonButton, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class PerfilPage implements OnInit {
  //Adicionar a descrição do usuário
  //Implementar a funcionalidade de alterar a foto do usuário
  //Implementar verificação de edição do perfil
  @ViewChild(IonModal) modal!: IonModal;
  private router = inject(Router);
  private clienteService = inject(clienteService);
  private prestadorService = inject(prestadorService);
  private administradorService = inject(administradorService);
  private autenticacaoService = inject(autenticacaoService);
  private toastController = inject(ToastController);
  protected usuario: Usuario | null = null;
  protected usuarioEdicao: Partial<Usuario> = {};
  protected tipoUsuario = 'Usuário';
  protected estaAberto = false;
  protected excluindoPerfil = false;
  protected fotoPerfil = 'assets/imgs/Foto User.png';

  constructor() {
    this.usuario = this.autenticacaoService.obterUsuarioAtual();
    if (!this.usuario) {
      this.router.navigate(['/login']);
      return;
    }
    this.usuarioEdicao = { ...this.usuario };
    this.tipoUsuario = this.usuario.tipoUsuario;
  }
  ionViewWillEnter() {
    this.usuario = this.autenticacaoService.obterUsuarioAtual();
    if (!this.usuario) {
      this.router.navigate(['/login']);
      return;
    }
    this.usuarioEdicao = { ...this.usuario };
    this.tipoUsuario = this.usuario.tipoUsuario;
  }

  goToConfig() {
    this.router.navigate(['/config']);
  }

  goToAgendamentos(){
    this.router.navigate(['/agendamentos']);
  }

  goToPrestadorDashboard() {
    if (this.usuario?.tipoUsuario === 'Prestador') {
      this.router.navigate(['/prestador']);
    }
  }

  setOpen(isOpen: boolean) {
    this.estaAberto = isOpen;
    if (isOpen && this.usuario) {
      this.usuarioEdicao = { ...this.usuario };
    }
  }

  protected editarPerfil() {
    if (!this.usuario) {
      this.setOpen(false);
      return;
    }

    this.usuario.Nome = this.usuarioEdicao.Nome ?? this.usuario.Nome;
    this.usuario.Email = this.usuarioEdicao.Email ?? this.usuario.Email;
    this.usuario.Telefone = this.usuarioEdicao.Telefone ?? this.usuario.Telefone;

    this.setOpen(false);
  }

  protected async excluirPerfil() {
    if (!this.usuario || this.excluindoPerfil) {
      return;
    }

    this.excluindoPerfil = true;
    try {
      let excluido = false;
      switch (this.usuario.tipoUsuario) {
        case 'Cliente': {
          const cliente = await this.clienteService.obterClientePorId(this.usuario.id);
          excluido = cliente ? await this.clienteService.excluir(cliente) : false;
          break;
        }
        case 'Prestador': {
          const prestador = await this.prestadorService.obterPrestadorPorId(this.usuario.id);
          excluido = prestador ? await this.prestadorService.excluir(prestador) : false;
          break;
        }
        case 'Administrador': {
          const administrador = await this.administradorService.obterAdministradorPorId(this.usuario.id);
          excluido = administrador ? await this.administradorService.excluir(administrador) : false;
          break;
        }
      }

      if (!excluido) {
        await this.mostrarToast('Não foi possível excluir o perfil. Tente novamente.');
        return;
      }

      this.autenticacaoService.limparSessao();
      this.router.navigate(['/login']);
    } catch {
      await this.mostrarToast('Não foi possível excluir o perfil. Tente novamente.');
    } finally {
      this.excluindoPerfil = false;
    }
  }

  private async mostrarToast(mensagem: string) {
    const toast = await this.toastController.create({
      message: mensagem,
      duration: 2500,
      position: 'bottom',
      color: 'danger',
    });
    await toast.present();
  }

  protected logout() {
    this.autenticacaoService.limparSessao();
    this.usuario = null;
    this.usuarioEdicao = {};
    this.tipoUsuario = 'Usuário';
    this.router.navigate(['/login']);
  }

    ngOnInit() {
  }

imagemErro(event: Event) {
  const img = event.target as HTMLImageElement;

  img.onerror = null;
  img.src = 'assets/imgs/Foto User.png';
}

}
