import { AfterViewInit, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormsModule, ValidationErrors, ValidatorFn, Validators, ReactiveFormsModule, NonNullableFormBuilder } from '@angular/forms';
import { IonContent, IonText, IonImg, IonButton, IonInput, IonSelectOption, IonSelect } from '@ionic/angular/standalone';
import { ToastController } from '@ionic/angular';
import { clienteService } from '../Services/cliente-service';
import { administradorService } from '../Services/administador-service';
import { prestadorService } from '../Services/prestador-service';
import { autenticacaoService } from '../Services/autenticacao-service';
import { Router } from '@angular/router';
import { Usuario } from '../Modelos/usuario-modelo';
import { animate } from 'animejs';
import { cpf } from 'cpf-cnpj-validator';
import { parsePhoneNumberFromString } from 'libphonenumber-js/max';

// Limita a entrada a CPF sem máscara ou à máscara oficial antes da validação da biblioteca.
const formatoCpf = /^(?:\d{11}|\d{3}\.\d{3}\.\d{3}-\d{2})$/;

// A biblioteca verifica os dígitos verificadores; o modo estrito rejeita formatos fora do padrão.
const cpfValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null =>
  cpf.isValid(String(control.value ?? ''), true) ? null : { cpfInvalido: true };

const telefoneValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {//ValidatorFn é a tipagem da função de validação, que recebe um AbstractControl, a qual é um tipo base para Form e retorna ValidationErrors ou null
  const entrada = String(control.value ?? '').trim();
  // Aceita dígitos e separadores comuns; o sinal + não é permitido neste campo nacional.
  if (!/^[\d\s().-]+$/.test(entrada)) {
    return { telefoneInvalido: true };
  }

  // O parser usa o Brasil como região e os metadados completos para validar o número e o DDD.
  const telefone = parsePhoneNumberFromString(entrada, 'BR');
  return telefone?.country === 'BR' && telefone.isValid()
    ? null
    : { telefoneInvalido: true };
};

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonInput, IonButton, IonSelect, IonSelectOption, IonContent, IonText, IonImg, CommonModule, FormsModule, ReactiveFormsModule]
})

export class LoginPage implements AfterViewInit {
  private clienteService = inject(clienteService);
  private administradorService = inject(administradorService);
  private prestadorService = inject(prestadorService);
  private autenticacaoService = inject(autenticacaoService);
  private router = inject(Router);
  private formBuilder = inject(NonNullableFormBuilder);
  private toastController = inject(ToastController);
  protected modo: 'login' | 'cadastro' = 'login';
  protected cadastroUsuarioForm = this.formBuilder.group({
    CPF: ['', [Validators.required, Validators.pattern(formatoCpf), cpfValidator]],//basicamente criamos um validator personallizado e um gap para ser usado dentro do pattern
    Nome: ['',[Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
    Telefone: ['', [Validators.required, telefoneValidator]],
    Email: ['',[Validators.email, Validators.maxLength(100)]],
    Senha: ['',[Validators.required, Validators.minLength(6), Validators.maxLength(45)]],
    TipoUsuario: ['', [Validators.required]]
  });
  protected loginForm = this.formBuilder.group({
    CPF: ['', [Validators.required, Validators.pattern(formatoCpf), cpfValidator]],
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
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();// Marca todos os campos como "tocados" para exibir mensagens de erro. tocado quer dizer que o usuário interagiu com o campo, e se ele não interagiu, a mensagem de erro não aparece
      await this.mostrarToast('Informe um CPF válido e a senha');
      return;
    }

    // Quase que literalmente deixa o cpf nu para poder comparar com os CPFs armazenados.
    const cpfUsuario = cpf.strip(this.loginForm.controls.CPF.value.trim());
    const senha = this.loginForm.get('Senha')?.value ?? '';

    let usuario: Usuario | null;
    try {
      usuario = await this.autenticacaoService.autenticar(cpfUsuario, senha);
    } catch {
      await this.mostrarToast('Não foi possível validar o login. Tente novamente');
      return;
    }

    if (usuario) {
      this.autenticacaoService.definirUsuarioAtual(usuario);
      const tipoUsuario = usuario.tipoUsuario;
      await this.mostrarToast(`Login ${tipoUsuario} bem sucedido`);
      this.loginForm.reset();
      this.router.navigate(['/perfil']);
      return;
    }

    await this.mostrarToast('Login falhou: CPF ou senha incorretos');
    this.loginForm.reset();
  }

  protected async cadastrarUsuario() {
    const tipoUsuario = this.cadastroUsuarioForm.value.TipoUsuario as 'Cliente' | 'Prestador' | null;
    if (!tipoUsuario) {
      this.cadastroUsuarioForm.controls.TipoUsuario.markAsTouched();
      await this.mostrarToast('Selecione um tipo de usuário');
      return;
    }

    if (this.cadastroUsuarioForm.invalid) {
      this.cadastroUsuarioForm.markAllAsTouched();
      await this.mostrarToast('Confira os campos destacados antes de cadastrar');
      return;
    }

    const cpfUsuario = cpf.strip(this.cadastroUsuarioForm.controls.CPF.value);
    try {
      if (await this.autenticacaoService.existeCPF(cpfUsuario)) {
        await this.mostrarToast('CPF já registrado para outro usuário');
        return;
      }
    } catch {
      await this.mostrarToast('Não foi possível validar o CPF. Tente novamente');
      return;
    }

    const telefone = parsePhoneNumberFromString(this.cadastroUsuarioForm.controls.Telefone.value, 'BR');
    const usuario = {
      id: 0,
      CPF: cpfUsuario,
      Nome: this.cadastroUsuarioForm.value.Nome ?? '',
      Telefone: telefone?.nationalNumber ?? '',
      Email: this.cadastroUsuarioForm.value.Email ?? '',
      Senha: this.cadastroUsuarioForm.value.Senha ?? '',
      tipoUsuario,
    } as Usuario;

    if (tipoUsuario === 'Cliente') {
      const cadastrado = await this.clienteService.adicionar(usuario);
      if (!cadastrado) {
        await this.mostrarToast('Não foi possível cadastrar o cliente');
        return;
      }
      this.autenticacaoService.definirUsuarioAtual(cadastrado);
      await this.mostrarToast(`Cadastro do ${cadastrado.tipoUsuario} bem sucedido`);
      this.router.navigate(['/home']);
      return;
    }

    if (tipoUsuario === 'Prestador') {
      const cadastrado = await this.prestadorService.adicionar(usuario);
      if (!cadastrado) {
        await this.mostrarToast('Não foi possível cadastrar o prestador');
        return;
      }
      this.autenticacaoService.definirUsuarioAtual(cadastrado);
      await this.mostrarToast(`Cadastro do ${cadastrado.tipoUsuario} bem sucedido`);
      this.cadastroUsuarioForm.reset();
      this.router.navigate(['/perfil']);
      return;
    }

    await this.mostrarToast('Tipo de usuário inválido');
    this.cadastroUsuarioForm.reset();
  }

  ngAfterViewInit() {
  const hero = document.querySelector('#hero-section');
  const form = document.querySelector('#form-container');

  if (hero) {
    animate(hero, {
      opacity: [0, 1],
      translateY: [18, 0],
      duration: 900,
      ease: 'outExpo'
    });
  }

  if (form) {
    animate(form, {
      opacity: [0, 1],
      translateY: [20, 0],
      duration: 900,
      delay: 150,
      ease: 'outExpo'
    });
  }
}

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
        animate(card, { scale: [0.5, 1], duration: 1000, ease: 'outExpo' });
        animate(proximo, { opacity: [0, 1], translateX: [30, 0], duration: 1000, ease: 'outExpo' });
      }
    });
  }
}

