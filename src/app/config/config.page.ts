import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import {
  IonContent,
  IonIcon,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButton,
  IonToggle
} from '@ionic/angular/standalone';

import { autenticacaoService } from '../Services/autenticacao-service';

import { addIcons } from 'ionicons';
import {
  closeOutline,
  optionsOutline,
  notificationsOutline,
  moonOutline,
  logOutOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-config',
  templateUrl: './config.page.html',
  styleUrls: ['./config.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonIcon,
    IonTitle,
    IonToolbar,
    IonButton,
    IonToggle,
    CommonModule
  ]
})
export class ConfigPage implements OnInit{
  private router = inject(Router);
  private autenticacaoService = inject(autenticacaoService);

  protected notificacoesAtivas = this.obterPreferencia(
    'notificacoesAtivas',
    true
  );

  protected modoEscuro = this.obterPreferencia(
    'modoEscuro',
    false
  );

  ngOnInit(): void {
    // Aplica o tema salvo assim que a página é inicializada.
    this.aplicarTema();
  }

  constructor() {
    addIcons({
      closeOutline,
      optionsOutline,
      notificationsOutline,
      moonOutline,
      logOutOutline
    });

  }

  voltarParaPerfil(): void {
    this.router.navigate(['/perfil']);
  }

  logout(): void {
    this.autenticacaoService.limparSessao();
    this.router.navigate(['/login']);
  }

  toggleNotificacoes(event: CustomEvent): void {
    this.notificacoesAtivas = Boolean(
      event.detail?.checked ?? false
    );

    this.salvarPreferencia(
      'notificacoesAtivas',
      this.notificacoesAtivas
    );
  }

  toggleModoEscuro(event: CustomEvent): void {
    this.modoEscuro = Boolean(
      event.detail?.checked ?? false
    );

    // Salva a escolha para as próximas visitas.
    this.salvarPreferencia('modoEscuro', this.modoEscuro);

    // Aplica o tema imediatamente.
    this.aplicarTema();
    console.log("Toggle modo escuro...");
  }

  private aplicarTema(): void {
    console.log("Aplicando tema...");
    
    const elementos = [
      document.documentElement,
      document.body
    ];

    elementos.forEach(elemento => {
      elemento.classList.toggle(
        'dark-theme',
        this.modoEscuro
      );

      elemento.classList.toggle(
        'light-theme',
        !this.modoEscuro
      );
    });
  }

  private obterPreferencia(
    chave: string,
    padrao: boolean
  ): boolean {
    const valor = localStorage.getItem(chave);

    return valor === null
      ? padrao
      : valor === 'false';
  }

  private salvarPreferencia(
    chave: string,
    valor: boolean
  ): void {
    localStorage.setItem(chave, String(valor));
    console.log("Salvando preferencia...");
  }

  administracao(){
    this.router.navigate(['/administracao']);
  }

}