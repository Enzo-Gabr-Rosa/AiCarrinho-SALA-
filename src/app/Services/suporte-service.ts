import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { prestadorService } from './prestador-service';
import { administradorService } from './administador-service';
import { clienteService } from './cliente-service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SuporteService {
  private http = inject(HttpClient);
  private prestadorService = inject(prestadorService);
  private clienteService = inject(clienteService);
  private api = `${environment.api}/suportes`;
}
