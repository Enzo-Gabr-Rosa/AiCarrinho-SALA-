import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, Validators, ReactiveFormsModule, NonNullableFormBuilder } from '@angular/forms';
import { IonContent, IonText, IonImg, IonButton, IonInput, IonSelectOption, IonSelect } from '@ionic/angular/standalone';
import { ToastController } from '@ionic/angular';
import { clienteService } from '../Services/cliente-service';
import { administradorService } from '../Services/administador-service';
import { prestadorService } from '../Services/prestador-service';
import { autenticacaoService } from '../Services/autenticacao-service';
import { Router } from '@angular/router';
import { Usuario } from '../Modelos/usuario-modelo';
import { animate } from 'animejs';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonInput, IonButton, IonSelect, IonSelectOption, IonContent, IonText, IonImg, CommonModule, FormsModule, ReactiveFormsModule]
})

export class LoginPage implements OnInit {
  private clienteService = inject(clienteService);
  private administradorService = inject(administradorService);
  private prestadorService = inject(prestadorService);
  private autenticacaoService = inject(autenticacaoService);
  private router = inject(Router);
  private formBuilder = inject(NonNullableFormBuilder);
  private toastController = inject(ToastController);
  protected modo: 'login' | 'cadastro' = 'login';
  protected cadastroUsuarioForm = this.formBuilder.group({
    CPF: ['',[Validators.required, Validators.minLength(11), Validators.maxLength(14), Validators.pattern(/^\d{11}$|^\d{3}\.\d{3}\.\d{3}-\d{2}$/)]],
    Nome: ['',[Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
    Telefone: ['',[Validators.required, Validators.minLength(10), Validators.maxLength(16)],Validators.pattern(/^\(\d{2}\)\s?\d{4,5}-?\d{4}$|^\d{10,11}$/)],
    Email: ['',[Validators.email, Validators.maxLength(100)]],
    Senha: ['',[Validators.required, Validators.minLength(6), Validators.maxLength(45)]],
    TipoUsuario: ['', [Validators.required]]
  });
  protected loginForm = this.formBuilder.group({
    Nome: ['', [Validators.required,Validators.minLength(3), Validators.maxLength(100)]],
    Senha: ['', [Validators.required,Validators.minLength(6),Validators.maxLength(45)]],
  });
  constructor() { 
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
  
  protected async login() {
    const nome = this.loginForm.get('Nome')?.value?.trim() ?? '';
    const senha = this.loginForm.get('Senha')?.value ?? '';

    const usuario = this.autenticacaoService.autenticar(nome, senha);
    console.log("Usuario autenticado:", usuario);

    if (usuario) {
      const tipoUsuario = usuario.tipoUsuario;
      await this.mostrarToast(`Login ${tipoUsuario} bem sucedido`);
      this.router.navigate(['/perfil']);
      return;
    }

    await this.mostrarToast('Login falhou: Nome de usuario ou senha incorretos');
  }

  protected async cadastrarUsuario() {
    const tipoUsuario = this.cadastroUsuarioForm.value.TipoUsuario as 'Cliente' | 'Prestador' | null;
    const usuario = {
      id: this.clienteService.criarNovoID(),
      CPF: this.cadastroUsuarioForm.value.CPF ?? '',
      Nome: this.cadastroUsuarioForm.value.Nome ?? '',
      Telefone: this.cadastroUsuarioForm.value.Telefone ?? '',
      Email: this.cadastroUsuarioForm.value.Email ?? '',
      Senha: this.cadastroUsuarioForm.value.Senha ?? '',
      tipoUsuario,
    } as Usuario;
    console.log("Tentando cadastrar usuário:", usuario);
    if (!tipoUsuario) {
      await this.mostrarToast('Selecione um tipo de usuário');
      return;
    }

    if (tipoUsuario === 'Cliente') {
      if (this.clienteService.verificarCPF(usuario.CPF)) {
        await this.mostrarToast('CPF do cliente já registrado');
        return;
      }
      this.clienteService.adicionar(usuario);
      this.autenticacaoService.definirUsuarioAtual(usuario);
      await this.mostrarToast(`Cadastro do ${tipoUsuario} bem sucedido`);
      this.router.navigate(['/home']);
      return;
    }

    if (tipoUsuario === 'Prestador') {
      if (this.prestadorService.verificarCPF(usuario.CPF)) {
        await this.mostrarToast('CPF do prestador já registrado');
        return;
      }
      this.prestadorService.adicionar(usuario);
      this.autenticacaoService.definirUsuarioAtual(usuario);
      await this.mostrarToast(`Cadastro do ${tipoUsuario} bem sucedido`);
      this.router.navigate(['/perfil']);
      return;
    }

    await this.mostrarToast('Tipo de usuário inválido');
  }
  
  ngOnInit(){}
  
protected trocarFormulario() {

  const login = document.querySelector('#login-content') as HTMLElement;
  const cadastro = document.querySelector('#cadastro-content') as HTMLElement;
  const card = document.querySelector('#auth-card') as HTMLElement;

  const mostrandoLogin = !login.classList.contains('display-off');

  const atual = mostrandoLogin ? login : cadastro;
  const proximo = mostrandoLogin ? cadastro : login;

  animate(card, {
    scale: [1, 0.5],
    duration: 500,
    ease: 'outQuad',

    onComplete: () => {

      atual.classList.add('display-off');
      proximo.classList.remove('display-off');

      animate(card, {
        scale: [0.5, 1],
        duration: 1000,
        ease: 'outExpo'
      });

      animate(proximo, {
        opacity: [0, 1],
        translateX: [30, 0],
        duration: 1000,
        ease: 'outExpo'
      });

    }
  });
}
}

