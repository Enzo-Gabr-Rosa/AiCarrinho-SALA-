import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonIcon
} from '@ionic/angular/standalone';

import { clienteService } from '../Services/cliente-service';
import { prestadorService } from '../Services/prestador-service';
import { administradorService } from '../Services/administador-service';

import { Cliente } from '../Modelos/cliente-modelo';
import { Prestador } from '../Modelos/prestador-modelo';
import { Administrador } from '../Modelos/administrador-modelo';
import { Usuario } from '../Modelos/usuario-modelo';

type TipoFiltro = 'Todos' | 'Cliente' | 'Prestador' | 'Administrador';

interface UsuarioLista {
  id: number;
  Nome: string;
  CPF: string;
  Telefone: string;
  Email: string;
  tipoUsuario: string;
  Descricao?: string;
  original: Usuario;
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
    IonContent,
    IonIcon
  ]
})
export class AdministracaoPage {
  clientes: Cliente[] = [];
  prestadores: Prestador[] = [];
  administradores: Administrador[] = [];

  termoPesquisa = '';
  filtroTipo: TipoFiltro = 'Todos';

  mostrarCadastroAdministrador = false;
  usuarioEditando: Usuario | null = null;
  salvando = false;

  mensagemErro = '';
  mensagemSucesso = '';

  novoAdministrador = {
    Nome: '',
    CPF: '',
    Telefone: '',
    Email: '',
    Senha: ''
  };

  dadosEdicao = {
    Nome: '',
    CPF: '',
    Telefone: '',
    Email: '',
    Senha: '',
    Descricao: ''
  };

  constructor(
    private clienteService: clienteService,
    private prestadorService: prestadorService,
    private administradorService: administradorService
  ) {}

  ionViewWillEnter(): void {
    this.carregarUsuarios();
  }

  async carregarUsuarios(): Promise<void> {
    try {
      this.clientes = await this.clienteService.obterClientes();
      this.prestadores = await this.prestadorService.obterPrestadores();
      this.administradores = await this.administradorService.obterAdministradores();
    } catch (erro) {
      console.error('Erro ao carregar usuários:', erro);
      this.mensagemErro = 'Não foi possível carregar os usuários.';
    }
  }

  get usuariosFiltrados(): UsuarioLista[] {
    const usuarios: Usuario[] = [
      ...this.clientes,
      ...this.prestadores,
      ...this.administradores
    ];

    const lista: UsuarioLista[] = usuarios.map(usuario => ({
      id: usuario.id,
      Nome: usuario.Nome,
      CPF: usuario.CPF,
      Telefone: usuario.Telefone,
      Email: usuario.Email,
      tipoUsuario: usuario.tipoUsuario,
      Descricao: usuario instanceof Prestador ? usuario.Descricao : '',
      original: usuario
    }));

    const termo = this.termoPesquisa.trim().toLocaleLowerCase();

    return lista.filter(usuario => {
      const correspondeTipo =
        this.filtroTipo === 'Todos' ||
        usuario.tipoUsuario === this.filtroTipo;

      const correspondePesquisa =
        !termo ||
        (usuario.Nome || '').toLocaleLowerCase().includes(termo) ||
        (usuario.CPF || '').toLocaleLowerCase().includes(termo) ||
        (usuario.Telefone || '').toLocaleLowerCase().includes(termo) ||
        (usuario.Email || '').toLocaleLowerCase().includes(termo);

      return correspondeTipo && correspondePesquisa;
    });
  }

  alternarCadastroAdministrador(): void {
    this.mostrarCadastroAdministrador = !this.mostrarCadastroAdministrador;
    this.mensagemErro = '';
    this.mensagemSucesso = '';

    if (this.mostrarCadastroAdministrador) {
      this.cancelarEdicao();
    } else {
      this.limparNovoAdministrador();
    }
  }

  async cadastrarAdministrador(): Promise<void> {
    this.mensagemErro = '';
    this.mensagemSucesso = '';

    if (
      !this.novoAdministrador.Nome.trim() ||
      !this.novoAdministrador.CPF.trim() ||
      !this.novoAdministrador.Telefone.trim() ||
      !this.novoAdministrador.Senha.trim()
    ) {
      this.mensagemErro = 'Preencha nome, CPF, telefone e senha.';
      return;
    }

    this.salvando = true;

    const administrador = new Administrador(
      0,
      this.novoAdministrador.CPF,
      this.novoAdministrador.Nome,
      this.novoAdministrador.Telefone,
      this.novoAdministrador.Email,
      this.novoAdministrador.Senha
    );

    try {
      const criado = await this.administradorService.adicionar(administrador);

      if (!criado) {
        this.mensagemErro = 'Não foi possível cadastrar. Verifique se o CPF já está cadastrado.';
        return;
      }

      this.mensagemSucesso = 'Administrador cadastrado com sucesso.';
      this.limparNovoAdministrador();
      await this.carregarUsuarios();
    } catch (erro) {
      console.error('Erro ao cadastrar administrador:', erro);
      this.mensagemErro = 'Ocorreu um erro ao cadastrar o administrador.';
    } finally {
      this.salvando = false;
    }
  }

  editarUsuario(usuario: Usuario): void {
    this.usuarioEditando = usuario;
    this.mostrarCadastroAdministrador = false;
    this.mensagemErro = '';
    this.mensagemSucesso = '';

    this.dadosEdicao = {
      Nome: usuario.Nome || '',
      CPF: usuario.CPF || '',
      Telefone: usuario.Telefone || '',
      Email: usuario.Email || '',
      Senha: '',
      Descricao: usuario instanceof Prestador ? usuario.Descricao || '' : ''
    };
  }

  async salvarEdicao(): Promise<void> {
    if (!this.usuarioEditando) {
      return;
    }

    this.mensagemErro = '';
    this.mensagemSucesso = '';

    if (
      !this.dadosEdicao.Nome.trim() ||
      !this.dadosEdicao.CPF.trim() ||
      !this.dadosEdicao.Telefone.trim()
    ) {
      this.mensagemErro = 'Preencha nome, CPF e telefone.';
      return;
    }

    this.salvando = true;

    const dados: any = {
      Nome: this.dadosEdicao.Nome,
      CPF: this.dadosEdicao.CPF,
      Telefone: this.dadosEdicao.Telefone,
      Email: this.dadosEdicao.Email || null
    };

    if (this.dadosEdicao.Senha.trim()) {
      dados.Senha = this.dadosEdicao.Senha;
    }

    try {
      let sucesso = false;

      if (this.usuarioEditando.tipoUsuario === 'Cliente') {
        sucesso = await this.clienteService.alterarDados(this.usuarioEditando.id, dados);
      } else if (this.usuarioEditando.tipoUsuario === 'Prestador') {
        dados.Descricao = this.dadosEdicao.Descricao;
        sucesso = await this.prestadorService.alterarDados(this.usuarioEditando.id, dados);
      } else {
        sucesso = await this.administradorService.alterarDados(this.usuarioEditando.id, dados);
      }

      if (!sucesso) {
        this.mensagemErro = 'Não foi possível salvar as alterações.';
        return;
      }

      this.mensagemSucesso = 'Usuário alterado com sucesso.';
      this.usuarioEditando = null;
      await this.carregarUsuarios();
    } catch (erro) {
      console.error('Erro ao alterar usuário:', erro);
      this.mensagemErro = 'Ocorreu um erro ao salvar as alterações.';
    } finally {
      this.salvando = false;
    }
  }

  cancelarEdicao(): void {
    this.usuarioEditando = null;
    this.dadosEdicao = {
      Nome: '',
      CPF: '',
      Telefone: '',
      Email: '',
      Senha: '',
      Descricao: ''
    };
    this.mensagemErro = '';
    this.mensagemSucesso = '';
  }

  private limparNovoAdministrador(): void {
    this.novoAdministrador = {
      Nome: '',
      CPF: '',
      Telefone: '',
      Email: '',
      Senha: ''
    };
  }
}
