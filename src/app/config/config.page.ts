import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { IonContent, IonIcon, IonHeader, IonTitle, IonToolbar, IonButton, IonToggle } from '@ionic/angular/standalone';
import { autenticacaoService } from '../Services/autenticacao-service';
import { addIcons } from 'ionicons';
import { closeOutline } from 'ionicons/icons';

@Component({
  selector: 'app-config',
  templateUrl: './config.page.html',
  styleUrls: ['./config.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonIcon, IonTitle, IonToolbar, IonButton, IonToggle, CommonModule],
})
export class ConfigPage {
  private router = inject(Router);
  private autenticacaoService = inject(autenticacaoService);
  protected notificacoesAtivas = this.obterPreferencia('notificacoesAtivas', true);
  protected modoEscuro = this.obterPreferencia('modoEscuro', false);

  constructor(){
    addIcons({ closeOutline });
  }

  voltarParaPerfil() {
    this.router.navigate(['/perfil']);
  }

  logout() {
    this.autenticacaoService.limparSessao();
    this.router.navigate(['/login']);
  }

  toggleNotificacoes(event: CustomEvent) {
    this.notificacoesAtivas = Boolean(event.detail?.checked ?? false);
    this.salvarPreferencia('notificacoesAtivas', this.notificacoesAtivas);
  }

  toggleModoEscuro(event: CustomEvent) {
    this.modoEscuro = Boolean(event.detail?.checked ?? false);
    this.salvarPreferencia('modoEscuro', this.modoEscuro);
    document.body.classList.toggle('dark-theme', this.modoEscuro);
  }

  private obterPreferencia(chave: string, padrao: boolean): boolean {
    const valor = localStorage.getItem(chave);
    return valor === null ? padrao : valor === 'true';
  }

  private salvarPreferencia(chave: string, valor: boolean) {
    localStorage.setItem(chave, String(valor));
  }
}
