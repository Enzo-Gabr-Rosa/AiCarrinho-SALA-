import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { animate, stagger } from 'animejs';

import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent
} from '@ionic/angular/standalone';

import { clienteService } from '../Services/cliente-service';
import { prestadorService } from '../Services/prestador-service';

interface UsuarioAdministracao {
  id: number;
  Nome: string;
  CPF: string;
  Telefone: string;
  Email: string;
  tipo: 'Cliente' | 'Prestador';
}

@Component({
  selector: 'app-administracao',
  templateUrl: './administracao.page.html',
  styleUrls: ['./administracao.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent
  ]
})
export class AdministracaoPage {
  private clienteService = inject(clienteService);
  private prestadorService = inject(prestadorService);

  protected usuarios: UsuarioAdministracao[] = [];
  protected usuarioEmEdicao: UsuarioAdministracao | null = null;

  protected termoBusca = '';
  protected filtro: 'Todos' | 'Cliente' | 'Prestador' = 'Todos';

  protected carregando = true;
  protected pesquisando = false;
  protected salvando = false;
  protected erroCarregamento = false;

  async ionViewWillEnter(): Promise<void> {
    await this.carregarUsuarios();

    requestAnimationFrame(() => {
      this.animarEntrada();
      this.animarLista();
    });
  }

  private async carregarUsuarios(): Promise<void> {
    this.carregando = true;
    this.erroCarregamento = false;

    requestAnimationFrame(() => {
      const carregamento = document.querySelector('.loading-spinner');

      if (carregamento) {
        animate(carregamento, {
          rotate: '1turn',
          duration: 900,
          ease: 'linear',
          loop: true
        });
      }
    });

    try {
      const [clientes, prestadores] = await Promise.all([
        this.clienteService.obterClientes(),
        this.prestadorService.obterPrestadores()
      ]);

      this.usuarios = [
        ...clientes.map(cliente => ({
          id: cliente.id,
          Nome: cliente.Nome,
          CPF: cliente.CPF,
          Telefone: cliente.Telefone,
          Email: cliente.Email,
          tipo: 'Cliente' as const
        })),

        ...prestadores.map(prestador => ({
          id: prestador.id,
          Nome: prestador.Nome,
          CPF: prestador.CPF,
          Telefone: prestador.Telefone,
          Email: prestador.Email,
          tipo: 'Prestador' as const
        }))
      ];

    } catch (erro) {
      console.error('Erro ao carregar usuários:', erro);
      this.erroCarregamento = true;
    } finally {
      this.carregando = false;
    }
  }

  protected usuariosFiltrados(): UsuarioAdministracao[] {
    const termo = this.normalizar(this.termoBusca);

    return this.usuarios.filter(usuario => {
      const correspondeTipo =
        this.filtro === 'Todos' || usuario.tipo === this.filtro;

      const correspondePesquisa = this.normalizar(
        `${usuario.Nome} ${usuario.CPF} ${usuario.Email}`
      ).includes(termo);

      return correspondeTipo && correspondePesquisa;
    });
  }

  protected pesquisar(): void {
    this.pesquisando = true;

    setTimeout(() => {
      this.pesquisando = false;

      requestAnimationFrame(() => {
        this.animarLista();
      });
    }, 180);
  }

  protected alterarFiltro(filtro: 'Todos' | 'Cliente' | 'Prestador'): void {
    this.filtro = filtro;
    this.pesquisar();
  }

  protected editarUsuario(usuario: UsuarioAdministracao): void {
    this.usuarioEmEdicao = { ...usuario };

    requestAnimationFrame(() => {
      const formulario = document.querySelector('.edit-form');

      if (formulario) {
        animate(formulario, {
          opacity: [0, 1],
          translateY: [12, 0],
          duration: 350,
          ease: 'outQuad'
        });
      }
    });
  }

  protected cancelarEdicao(): void {
    this.usuarioEmEdicao = null;
  }

  protected async salvarAlteracoes(): Promise<void> {
    if (!this.usuarioEmEdicao || this.salvando) {
      return;
    }

    this.salvando = true;

    const usuario = this.usuarioEmEdicao;

    const dados = {
      Nome: usuario.Nome,
      CPF: usuario.CPF,
      Telefone: usuario.Telefone,
      Email: usuario.Email
    };

    try {
      let sucesso = false;

      if (usuario.tipo === 'Cliente') {
        sucesso = await this.clienteService.alterarDados(
          usuario.id,
          dados
        );
      } else {
        sucesso = await this.prestadorService.alterarDados(
          usuario.id,
          dados
        );
      }

      if (sucesso) {
        await this.carregarUsuarios();
        this.usuarioEmEdicao = null;
      } else {
        console.error('Não foi possível salvar as alterações.');
      }
    } catch (erro) {
      console.error('Erro ao alterar usuário:', erro);
    } finally {
      this.salvando = false;
    }
  }

  protected quantidadePorTipo(tipo: 'Cliente' | 'Prestador'): number {
    return this.usuarios.filter(usuario => usuario.tipo === tipo).length;
  }

  private normalizar(valor: string): string {
    return valor
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  }

  private animarEntrada(): void {
    animate('.page-intro, .summary-grid, .search-panel', {
      opacity: [0, 1],
      translateY: [18, 0],
      duration: 550,
      delay: stagger(100),
      ease: 'outExpo'
    });
  }

  private animarLista(): void {
    const itens = document.querySelectorAll('.user-row');

    if (itens.length > 0) {
      animate(itens, {
        opacity: [0, 1],
        translateY: [10, 0],
        duration: 350,
        delay: stagger(35),
        ease: 'outQuad'
      });
    }
  }
}