import { animate, stagger } from 'animejs';
import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonContent,
  IonInput,
  IonHeader,
  IonButtons,
  IonModal,
  IonButton,
  IonTitle,
  IonToolbar
} from '@ionic/angular/standalone';
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
  imports: [
    IonContent,
    IonInput,
    IonHeader,
    IonButtons,
    IonModal,
    IonButton,
    IonTitle,
    IonToolbar,
    CommonModule,
    FormsModule
  ]
})
export class PerfilPage implements OnInit {
  // Adicionar a descrição do usuário.
  // Implementar a funcionalidade de alterar a foto do usuário.

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

  protected errosValidacao: {
    Nome: string;
    Email: string;
    Telefone: string;
    CPF: string;
  } = {
    Nome: '',
    Email: '',
    Telefone: '',
    CPF: ''
  };

  protected erroAnimacao = false;

  constructor() {
    this.usuario = this.autenticacaoService.obterUsuarioAtual();

    if (!this.usuario) {
      this.router.navigate(['/login']);
      return;
    }

    this.usuarioEdicao = { ...this.usuario };
    this.tipoUsuario = this.usuario.tipoUsuario;
  }

  ionViewWillEnter(): void {
    this.usuario = this.autenticacaoService.obterUsuarioAtual();

    if (!this.usuario) {
      this.router.navigate(['/login']);
      return;
    }

    this.usuarioEdicao = { ...this.usuario };
    this.tipoUsuario = this.usuario.tipoUsuario;
    this.animarPerfil();
  }

  goToConfig(): void {
    this.router.navigate(['/config']);
  }

  goToAgendamentos(): void {
    this.router.navigate(['/agendamentos']);
  }

  goToPrestadorDashboard(): void {
    if (this.usuario?.tipoUsuario === 'Prestador') {
      this.router.navigate(['/prestador']);
    }
  }

  setOpen(isOpen: boolean): void {
    this.estaAberto = isOpen;
    this.erroAnimacao = false;
    this.errosValidacao = {
      Nome: '',
      Email: '',
      Telefone: '',
      CPF: ''
    };

    if (isOpen && this.usuario) {
      this.usuarioEdicao = { ...this.usuario };
    }
  }

  protected async editarPerfil(): Promise<void> {
    if (!this.usuario) {
      this.setOpen(false);
      return;
    }

    if (!this.validarFormulario()) {
      // Reinicia a animação para que ela possa ser executada novamente.
      this.erroAnimacao = false;
      setTimeout(() => {
        this.erroAnimacao = true;
      }, 0);

      await this.mostrarToast(
        'Verifique os campos destacados antes de salvar.'
      );
      return;
    }

    const nome = String(this.usuarioEdicao.Nome ?? '').trim();
    const email = String(this.usuarioEdicao.Email ?? '').trim();
    const telefone = String(this.usuarioEdicao.Telefone ?? '').trim();

    this.usuario.Nome = nome;
    this.usuario.Email = email;
    this.usuario.Telefone = telefone;

    this.usuarioEdicao = { ...this.usuario };
    this.errosValidacao = {
      Nome: '',
      Email: '',
      Telefone: '',
      CPF: ''
    };

    this.erroAnimacao = false;
    this.setOpen(false);
  }

  protected async excluirPerfil(): Promise<void> {
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
          excluido = administrador
            ? await this.administradorService.excluir(administrador)
            : false;
          break;
        }
      }

      if (!excluido) {
        await this.mostrarToast(
          'Não foi possível excluir o perfil. Tente novamente.'
        );
        return;
      }

      this.autenticacaoService.limparSessao();
      this.router.navigate(['/login']);
    } catch {
      await this.mostrarToast(
        'Não foi possível excluir o perfil. Tente novamente.'
      );
    } finally {
      this.excluindoPerfil = false;
    }
  }

  private async mostrarToast(mensagem: string): Promise<void> {
    const toast = await this.toastController.create({
      message: mensagem,
      duration: 2500,
      position: 'bottom',
      color: 'danger'
    });

    await toast.present();
  }

  protected logout(): void {
    this.autenticacaoService.limparSessao();
    this.usuario = null;
    this.usuarioEdicao = {};
    this.tipoUsuario = 'Usuário';
    this.router.navigate(['/login']);
  }

  ngOnInit(): void {}

  imagemErro(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.onerror = null;
    img.src = 'assets/imgs/Foto User.png';
  }

  protected validarCampo(
    campo: 'Nome' | 'Email' | 'Telefone' | 'CPF'
  ): void {
    switch (campo) {
      case 'Nome': {
        const nome = String(this.usuarioEdicao.Nome ?? '').trim();

        if (!nome) {
          this.errosValidacao.Nome = 'O nome é obrigatório.';
        } else if (nome.length < 3) {
          this.errosValidacao.Nome =
            'O nome deve ter pelo menos 3 caracteres.';
        } else if (nome.length > 100) {
          this.errosValidacao.Nome =
            'O nome deve ter no máximo 100 caracteres.';
        } else {
          this.errosValidacao.Nome = '';
        }

        break;
      }

      case 'Email': {
        const email = String(this.usuarioEdicao.Email ?? '').trim();

        // O e-mail é opcional; valide o formato somente se foi preenchido.
        if (!email) {
          this.errosValidacao.Email = '';
        } else if (email.length > 254) {
          this.errosValidacao.Email = 'O e-mail é muito longo.';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
          this.errosValidacao.Email =
            'Informe um endereço de e-mail válido.';
        } else {
          this.errosValidacao.Email = '';
        }

        break;
      }

      case 'Telefone': {
        const telefone = String(this.usuarioEdicao.Telefone ?? '').trim();
        const digitos = telefone.replace(/\D/g, '');

        if (!telefone) {
          this.errosValidacao.Telefone = 'O telefone é obrigatório.';
        } else if (/[^\d\s()+.-]/.test(telefone)) {
          this.errosValidacao.Telefone =
            'Use apenas números e caracteres de formatação.';
        } else if (digitos.length !== 10 && digitos.length !== 11) {
          this.errosValidacao.Telefone =
            'Informe um telefone com DDD: 10 ou 11 dígitos.';
        } else if (/^(\d)\1+$/.test(digitos)) {
          this.errosValidacao.Telefone = 'Informe um telefone válido.';
        } else if (!/^[1-9]{2}/.test(digitos)) {
          this.errosValidacao.Telefone = 'Informe um DDD válido.';
        } else {
          this.errosValidacao.Telefone = '';
        }

        break;
      }

      case 'CPF': {
        const cpfOriginal = String(this.usuarioEdicao.CPF ?? '').trim();
        const cpf = cpfOriginal.replace(/\D/g, '');
        const formatoCpfValido = /^[\d.\-\s]+$/.test(cpfOriginal);

        if (!cpfOriginal) {
          this.errosValidacao.CPF = 'O CPF é obrigatório.';
        } else if (!formatoCpfValido) {
          this.errosValidacao.CPF =
            'O CPF deve conter apenas números, pontos ou hífen.';
        } else if (cpf.length !== 11) {
          this.errosValidacao.CPF =
            'O CPF deve conter exatamente 11 dígitos.';
        } else if (/^(\d)\1{10}$/.test(cpf)) {
          this.errosValidacao.CPF = 'Informe um CPF válido.';
        } else {
          const numeros = cpf.split('').map(Number);

          let soma = 0;
          for (let i = 0; i < 9; i++) {
            soma += numeros[i] * (10 - i);
          }

          let digito1 = (soma * 10) % 11;
          if (digito1 === 10) {
            digito1 = 0;
          }

          soma = 0;
          for (let i = 0; i < 10; i++) {
            soma += numeros[i] * (11 - i);
          }

          let digito2 = (soma * 10) % 11;
          if (digito2 === 10) {
            digito2 = 0;
          }

          if (numeros[9] !== digito1 || numeros[10] !== digito2) {
            this.errosValidacao.CPF =
              'Os dígitos verificadores do CPF são inválidos.';
          } else {
            this.errosValidacao.CPF = '';
          }
        }

        break;
      }
    }
  }

  private validarFormulario(): boolean {
    this.validarCampo('Nome');
    this.validarCampo('Email');
    this.validarCampo('Telefone');

    return !Object.values(this.errosValidacao).some(
      mensagem => mensagem.length > 0
    );
  }

  private animarPerfil(): void {
    const elementos = document.querySelectorAll(
      '.page-intro, .profile-card, .information-section, .actions-section, .profile-footer'
    );

    if (!elementos.length) {
      return;
    }

    animate(elementos, {
      opacity: [0, 1],
      translateY: [18, 0],
      duration: 650,
      delay: stagger(100),
      ease: 'outExpo'
    });

    const foto = document.querySelector('.profile-photo-wrapper');

    if (foto) {
      animate(foto, {
        scale: [0.88, 1],
        duration: 700,
        delay: 150,
        ease: 'outBack'
      });
    }
  }
}
