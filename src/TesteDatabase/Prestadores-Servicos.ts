import { Prestador } from '../app/Modelos/prestador-modelo';
import { Servico } from '../app/Modelos/servico-modelo';

export const PrestadoresServicos: Prestador[] = [
    {
        id: 1,
        CPF: "900.800.700.60",
        Nome: "Carlos Silva",
        Telefone: "(99) 6666-6666",
        Email: "carlos.mecanico@oficina.com",
        Senha: "C4rl0sM3c4n1c0",
        Servicos: [
            {
                id: 1,
                nome: 'Troca de óleo',
                descricao: 'Troca de óleo e filtro com revisão básica do veículo.',
                horarioInicio: new Date('2026-06-14T08:00:00'),
                horarioFim: new Date('2026-06-14T12:00:00')
            } as Servico,
            {
                id: 2,
                nome: 'Diagnóstico elétrico',
                descricao: 'Verificação de bateria, alternador e sistema elétrico.',
                horarioInicio: new Date('2026-06-14T13:00:00'),
                horarioFim: new Date('2026-06-14T17:00:00')
            } as Servico
        ],
        Descricao: "Especialista em mecânica geral, com mais de 10 anos de experiência em reparos automotivos. Oferece serviços de manutenção preventiva, troca de óleo, alinhamento e balanceamento, além de diagnósticos avançados para garantir o melhor desempenho do seu veículo.",
        tipoUsuario: 'Prestador'
    },
    {
        id: 2,
        CPF: "800.700.600.50",
        Nome: "Ana Santos",
        Telefone: "(99) 6666-6665",
        Email: "ana.santos@oficina.com",
        Senha: "4n4S4nt0sM3c",
        Servicos: [
            {
                id: 1,
                nome: 'Alinhamento e balanceamento',
                descricao: 'Ajuste de suspensão e balanceamento das rodas.',
                horarioInicio: new Date('2026-06-14T09:00:00'),
                horarioFim: new Date('2026-06-14T13:00:00')
            } as Servico,
            {
                id: 2,
                nome: 'Revisão de freios',
                descricao: 'Verificação e substituição de pastilhas e discos, se necessário.',
                horarioInicio: new Date('2026-06-14T14:00:00'),
                horarioFim: new Date('2026-06-14T18:00:00')
            } as Servico
        ],
        Descricao: "Especialista em mecânica geral, com mais de 10 anos de experiência em reparos automotivos. Oferece serviços de manutenção preventiva, troca de óleo, alinhamento e balanceamento, além de diagnósticos avançados para garantir o melhor desempenho do seu veículo.",
        tipoUsuario: 'Prestador'
    },
    {
        id: 3,
        CPF: "700.600.500.40",
        Nome: "Pedro Costa",
        Telefone: "(99) 6666-6664",
        Email: "pedro.eletrica@oficina.com",
        Senha: "P3dr0El3tr1c4",
        Servicos: [
            {
                id: 1,
                nome: 'Instalação de som',
                descricao: 'Instalação e configuração de áudio automotivo.',
                horarioInicio: new Date('2026-06-14T08:30:00'),
                horarioFim: new Date('2026-06-14T11:30:00')
            } as Servico,
            {
                id: 2,
                nome: 'Revisão elétrica',
                descricao: 'Diagnóstico de fiação, luzes e componentes elétricos.',
                horarioInicio: new Date('2026-06-14T13:30:00'),
                horarioFim: new Date('2026-06-14T17:30:00')
            } as Servico
        ],
        Descricao: " ",
        tipoUsuario: 'Prestador'
    },
    {
        id: 4,
        CPF: "600.500.400.30",
        Nome: "Marina Oliveira",
        Telefone: "(99) 6666-6663",
        Email: "marina.pintura@oficina.com",
        Senha: "M4r1n4P1ntur4",
        Servicos: [
            {
                id: 1,
                nome: 'Polimento e vitrificação',
                descricao: 'Polimento da pintura e aplicação de proteção.',
                horarioInicio: new Date('2026-06-14T09:00:00'),
                horarioFim: new Date('2026-06-14T12:00:00')
            } as Servico,
            {
                id: 2,
                nome: 'Repintura parcial',
                descricao: 'Repintura de partes específicas do veículo.',
                horarioInicio: new Date('2026-06-14T14:00:00'),
                horarioFim: new Date('2026-06-14T18:00:00')
            } as Servico
        ],
        Descricao: "Especialista em pintura automotiva, com mais de 8 anos de experiência em restauração e customização de veículos. Oferece serviços de repintura, polimento e proteção da pintura, utilizando técnicas avançadas para garantir um acabamento impecável e duradouro.",
        tipoUsuario: 'Prestador'
    },
    {
        id: 5,
        CPF: "500.400.300.20",
        Nome: "Roberto Lima",
        Telefone: "(99) 6666-6662",
        Email: "roberto.funilaria@oficina.com",
        Senha: "R0b3rt0Fun1l4r",
        Servicos: [
            {
                id: 1,
                nome: 'Desamassamento de portas',
                descricao: 'Correção de deformações e acabamento da lataria.',
                horarioInicio: new Date('2026-06-14T08:00:00'),
                horarioFim: new Date('2026-06-14T11:00:00')
            } as Servico,
            {
                id: 2,
                nome: 'Solda estrutural',
                descricao: 'Reparos com solda para danos mais profundos.',
                horarioInicio: new Date('2026-06-14T13:00:00'),
                horarioFim: new Date('2026-06-14T17:00:00')
            } as Servico
        ],
        Descricao: "Especialista em funilaria automotiva, com mais de 12 anos de experiência em reparos estruturais e estéticos. Oferece serviços de desamassamento, soldagem e restauração de carrocerias, garantindo que seu veículo volte a ter a aparência original após acidentes ou danos.",
        tipoUsuario: 'Prestador'
    },
    {
        id: 6,
        CPF: "400.300.200.10",
        Nome: "Juliana Ferreira",
        Telefone: "(99) 6666-6661",
        Email: "",
        Senha: "Jul1F3rr3ir4B4l",
        Servicos: [
            {
                id: 1,
                nome: 'Alinhamento',
                descricao: 'Ajuste de geometria para melhor dirigibilidade.',
                horarioInicio: new Date('2026-06-14T09:30:00'),
                horarioFim: new Date('2026-06-14T12:30:00')
            } as Servico,
            {
                id: 2,
                nome: 'Balanceamento',
                descricao: 'Balanceamento de rodas para reduzir vibrações.',
                horarioInicio: new Date('2026-06-14T14:00:00'),
                horarioFim: new Date('2026-06-14T17:00:00')
            } as Servico
        ],
        Descricao: "Especialista em balanceamento e alinhamento, com mais de 7 anos de experiência em garantir a estabilidade e segurança dos veículos. Oferece serviços de alinhamento de direção, balanceamento de rodas e suspensão, utilizando equipamentos modernos para melhorar o desempenho e prolongar a vida útil dos pneus.",
        tipoUsuario: 'Prestador'
    },
    {
        id: 7,
        CPF: "300.200.100.90",
        Nome: "Marcos Souza",
        Telefone: "(99) 6666-6660",
        Email: "",
        Senha: "M4rc0sB0rr4ch4",
        Servicos: [
            {
                id: 1,
                nome: 'Troca de pneus',
                descricao: 'Substituição e montagem de pneus novos.',
                horarioInicio: new Date('2026-06-14T08:00:00'),
                horarioFim: new Date('2026-06-14T12:00:00')
            } as Servico,
            {
                id: 2,
                nome: 'Conserto de furo',
                descricao: 'Reparo rápido de furos e vazamentos.',
                horarioInicio: new Date('2026-06-14T13:00:00'),
                horarioFim: new Date('2026-06-14T16:00:00')
            } as Servico
        ],
        Descricao: "Especialista em troca de pneus e serviços de borracharia, com mais de 5 anos de experiência em manutenção de rodas e pneus. Oferece serviços de troca de pneus, conserto de furos, balanceamento e alinhamento, garantindo que seu veículo esteja sempre seguro e pronto para rodar.",
        tipoUsuario: 'Prestador'
    }
];