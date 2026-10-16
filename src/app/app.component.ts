import { Component, inject } from '@angular/core';
import { NgIf } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { IonApp, IonIcon, IonRouterOutlet } from '@ionic/angular/standalone';
import { Router, NavigationEnd } from '@angular/router';
import { addIcons } from 'ionicons';
import { personOutline, homeOutline } from 'ionicons/icons';
import { filter } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  imports: [IonApp, NgIf, IonIcon, IonRouterOutlet, HttpClientModule],
})
export class AppComponent {
  private router = inject(Router);

  public mostrarNavBar = true;
  public paginaAtiva = '';

  constructor() {
    addIcons({
      personOutline,
      homeOutline,
    });

    this.atualizarNavBar();

    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.atualizarNavBar();
      });
  }

  private atualizarNavBar() {
    const rota = this.router.url.split('?')[0].split('#')[0];

    this.mostrarNavBar = !(
      rota === '/login' ||
      rota.startsWith('/login/')
    );

    if (rota === '/home' || rota === '/') {
      this.paginaAtiva = 'home';
    } else if (rota === '/perfil') {
      this.paginaAtiva = 'perfil';
    } else {
      this.paginaAtiva = '';
    }
  }

  goToHome() {
    this.router.navigate(['/home']);
  }

  goToPerfil() {
    this.router.navigate(['/perfil']);
  }
}