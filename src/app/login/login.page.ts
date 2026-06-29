import { Component, inject, OnInit, ɵsetInjectorProfilerContext } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule,FormBuilder, Validators, ReactiveFormsModule, NonNullableFormBuilder } from '@angular/forms';
import { IonContent, IonText, IonImg, IonHeader, IonTitle, IonToolbar, IonButton, IonIcon, IonCol, IonRow, IonGrid, IonItem, IonInput, IonList, IonSelectOption, IonSelect } from '@ionic/angular/standalone';
import { ToastController } from '@ionic/angular';
import { clienteService } from '../Services/cliente-service';
import { administradorService } from '../Services/administador-service';
import { prestadorService } from '../Services/prestador-service';
import {Router} from '@angular/router';
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
  private router = inject(Router);
  private formBuilder = inject(NonNullableFormBuilder);
  private toastController = inject(ToastController); 
  protected modo: 'login' | 'cadastro' = 'login';
  protected cadastroUsuarioForm = this.formBuilder.group({
    CPF: ['',[Validators.required, Validators.minLength(11), Validators.maxLength(14)]],
    Nome: ['',[Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
    Telefone: ['',[Validators.required, Validators.minLength(10), Validators.maxLength(15)]],
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
    return 'Desconhecido';
  }
  
  protected async login(){
    const cliente = this.clienteService.obterClientePorNome(this.loginForm.get('Nome')!.value);
    const administrador = this.administradorService.obterAdministradorPorNome(this.loginForm.get('Nome')!.value);
    const prestador = this.prestadorService.obterPrestadorPorNome(this.loginForm.get('Nome')!.value);

    const usuario = cliente ?? administrador ?? prestador; // ?? serve para retornar o primeiro valor não nulo ou indefinido

    if (usuario && usuario.Senha === this.loginForm.get('Senha')!.value) {
      const tipoUsuario = this.identificarTipoUsuario(usuario);
      await this.mostrarToast(`Login ${tipoUsuario} bem sucedido`);
      this.router.navigate(['/perfil'], { state: { usuario: usuario } }); // Navega para a página do perfil e passa o objeto do usuário como estado
      return;
    }
    await this.mostrarToast('Login falhou: Nome de usuario ou senha incorretos');
  }

  protected async cadastrarUsuario() {
    const usuario = {
      id: this.clienteService.criarNovoID(),
      CPF: this.cadastroUsuarioForm.value.CPF!,
      Nome: this.cadastroUsuarioForm.value.Nome!,
      Telefone: this.cadastroUsuarioForm.value.Telefone!,
      Email: this.cadastroUsuarioForm.value.Email!,
      Senha: this.cadastroUsuarioForm.value.Senha!,
      tipoUsuario: this.cadastroUsuarioForm.value.TipoUsuario! as 'Cliente' | 'Administrador' | 'Prestador',
    };
    if (usuario.tipoUsuario === 'Cliente') {
      if(this.clienteService.verificarCPF(usuario.CPF)){
        await this.mostrarToast('CPF do cliente já registrado');
        return;
      }
      this.clienteService.adicionar(usuario);
      await this.mostrarToast(`Cadastro do ${usuario.tipoUsuario} bem sucedido`);
      this.router.navigate(['/home'], { state: { usuario: usuario } });
      return;
    } else if (usuario.tipoUsuario === 'Prestador') {
      if(this.prestadorService.verificarCPF(usuario.CPF)){
        await this.mostrarToast('CPF do prestador já registrado');
        return;
      }
      this.prestadorService.adicionar(usuario);
      await this.mostrarToast(`Cadastro do ${usuario.tipoUsuario} bem sucedido`);
      this.router.navigate(['/home'], { state: { usuario: usuario } });
      return;
    } else {
      await this.mostrarToast('Erro');
    }
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

