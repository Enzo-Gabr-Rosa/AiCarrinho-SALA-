import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonContent, IonInput, IonHeader, IonButtons, IonModal, IonButton, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { Usuario } from '../Modelos/usuario-modelo';
import { clienteService } from '../Services/cliente-service';

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

  protected usuario: Usuario;
  protected tipoUsuario = 'Usuário';
  protected estaAberto = false;

  constructor() {
    this.usuario = this.router.currentNavigation()?.extras.state?.['usuario'] ?? null; // Obtém o objeto do usuário passado como estado na navegação
    this.tipoUsuario = this.identificarTipoUsuario(this.usuario);
  }

  private identificarTipoUsuario(usuario: Usuario): string {
    if (usuario.tipoUsuario === 'Cliente') {
      return 'Cliente';
    }
    if (usuario.tipoUsuario === 'Administrador') {
      return 'Administrador';
    }
    if (usuario.tipoUsuario === 'Prestador') {
      return 'Prestador';
    }
    return 'Usuário';
  }

  goToLista() {
    this.router.navigate(['/home'], { state: { usuario: this.usuario } });
  }

  setOpen(isOpen: boolean) {
    this.estaAberto = isOpen;
  }

  protected editarPerfil() {
    
    this.setOpen(false);
  }

  protected excluirPerfil() {
    alert("entrou")
  }

    ngOnInit() {
  }



}
