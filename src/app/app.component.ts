import { Component, inject } from '@angular/core';
import { NgIf } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { IonApp, IonIcon, IonButton, IonRouterOutlet } from '@ionic/angular/standalone';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { addIcons } from 'ionicons';
import { personOutline, homeOutline } from 'ionicons/icons';
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  imports: [IonApp, NgIf, IonIcon, IonButton, IonRouterOutlet, HttpClientModule],
})
export class AppComponent {
  private router = inject(Router);
  public mostrarNavBar = true;

  constructor() {
    addIcons({ personOutline, homeOutline })

    this.router.events.subscribe(() => {
      this.mostrarNavBar = !this.router.url.startsWith('/login');
    });
  }

    goToHome() {
    this.router.navigate(['/home']);
  }

    goToPerfil() {
    this.router.navigate(['/perfil']);
  }
}
