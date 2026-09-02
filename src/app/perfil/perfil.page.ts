import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonContent, IonInput, IonHeader, IonButtons, IonModal, IonButton, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { Usuario } from '../Modelos/usuario-modelo';
import { clienteService } from '../Services/cliente-service';
import { autenticacaoService } from '../Services/autenticacao-service';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss'],
  standalone: true,
  imports: [IonContent, IonInput, IonHeader, IonButtons, IonModal, IonButton, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class PerfilPage implements OnInit {
  @ViewChild(IonModal) modal!: IonModal;
  private router = inject(Router);
  private clienteService = inject(clienteService);
  private autenticacaoService = inject(autenticacaoService);
  protected usuario: Usuario | null = null;
  protected usuarioEdicao: Partial<Usuario> = {};
  protected tipoUsuario = 'Usuário';
  protected estaAberto = false;
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

  goToConfig() {
    this.router.navigate(['/config']);
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

  protected excluirPerfil() {
    if (!this.usuario) {
      return;
    }

    if (this.usuario.tipoUsuario === 'Cliente') {
      const cliente = this.clienteService.obterClientePorId(this.usuario.id);
      if (cliente) {
        this.clienteService.excluir(cliente);
      }
    }

    this.autenticacaoService.limparSessao();
    this.router.navigate(['/login']);
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
