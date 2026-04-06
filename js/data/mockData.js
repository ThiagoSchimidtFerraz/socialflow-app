// ====================================
// SOCIALFLOW — Dados Mock
// ====================================

const ROLE_LABELS = {
    admin: 'Administrador',
    social_media: 'Social Media',
    designer: 'Designer',
    cliente: 'Cliente',
    master: 'Master Hub',
};

const USER_STATUS_LABELS = {
    pendente: 'Pendente',
    aprovado: 'Aprovado',
    rejeitado: 'Rejeitado',
};

const USER_STATUS_CLASSES = {
    pendente: 'badge-aguardando',
    aprovado: 'badge-aprovado',
    rejeitado: 'badge-revisao',
};

const STATUS_LABELS = {
    rascunho: 'Planejamento',
    aguardando_aprovacao_conteudo: 'Aprov. Conteúdo',
    revisao_conteudo: 'Ajuste Conteúdo',
    em_producao: 'Design',
    aguardando_revisao_interna: 'Rev. Interna',
    revisao_interna: 'Ajuste Design',
    aguardando_aprovacao_artes: 'Aprov. Final',
    revisao_artes: 'Ajuste Final',
    aprovado: 'Aprovadas',
    agendado: 'Agendado',
    concluido: 'Concluído',
};

const STATUS_CLASSES = {
    rascunho: 'badge-rascunho',
    aguardando_aprovacao_conteudo: 'badge-aguardando',
    revisao_conteudo: 'badge-revisao',
    em_producao: 'badge-em-producao',
    aguardando_revisao_interna: 'badge-info',
    revisao_interna: 'badge-revisao',
    aguardando_aprovacao_artes: 'badge-aguardando',
    revisao_artes: 'badge-revisao',
    aprovado: 'badge-aprovado',
    agendado: 'badge-info',
    concluido: 'badge-success',
};

const MESES_LABELS = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril',
    'Maio', 'Junho', 'Julho', 'Agosto',
    'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

const MESES_ABREV = [
    'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
    'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez',
];

// ---- EMPRESAS (Agências que usam o SaaS) ----
const INITIAL_EMPRESAS = [
    {
        id: 'emp1',
        nome: 'Digital Growth',
        plano: 'premium',
        status: 'ativo',
        criadoEm: '2026-01-01T00:00:00',
    }
];

// ---- CONTAS DE CLIENTE (marcas/empresas) ----
const INITIAL_CONTAS = [
    {
        id: 'conta1',
        empresaId: 'emp1',
        nome: 'Loja Fashion',
        cor: '#7C3AED',
        codigoConvite: 'FASHION2026',
        criadoEm: '2026-01-10T10:00:00',
    },
    {
        id: 'conta2',
        empresaId: 'emp1',
        nome: 'Café Gourmet',
        cor: '#D97706',
        codigoConvite: 'GOURMET2026',
        criadoEm: '2026-02-15T14:00:00',
    },
];

// ---- USUÁRIOS ----
const INITIAL_USERS = [
    {
        id: 'u0',
        empresaId: 'emp1',
        nome: 'Desenvolvedor Master',
        email: 'thiagoferraztsf@gmail.com',
        senha: 'Thi6452*',
        role: 'master',
        avatar: 'SF',
        status: 'aprovado',
        contasIds: ['conta1', 'conta2'],
        criadoEm: '2026-04-01T00:00:00',
    },
    {
        id: 'u1',
        empresaId: 'emp1',
        nome: 'Thiago Admin',
        email: 'admin@socialflow.com',
        senha: '123',
        role: 'admin',
        avatar: 'TF',
        status: 'aprovado',
        contasIds: ['conta1', 'conta2'],
        criadoEm: '2026-04-01T00:00:00',
    },
    {
        id: 'u_sm_seed',
        empresaId: 'emp1',
        nome: 'Ana Social Media',
        email: 'ana@socialflow.com',
        senha: '123',
        role: 'social_media',
        avatar: 'AS',
        status: 'aprovado',
        contasIds: ['conta1', 'conta2'],
        criadoEm: '2026-04-01T00:00:00',
    }
];

const INITIAL_CRONOGRAMAS = [
    {
        id: 'c1',
        contaId: 'conta1',
        mesReferencia: '2026-04',
        titulo: 'Campanha Dia das Mães',
        descricao: 'Cronograma completo de postagens para a campanha do Dia das Mães, incluindo stories, feed e reels.',
        dataInicio: '2026-04-01',
        dataFim: '2026-05-12',
        status: 'aprovado',
        criadoPor: 'u1',
        criadoEm: '2026-03-20T10:00:00',
        copys: [
            { id: 'cp1', titulo: 'Post Feed — Contagem Regressiva', texto: '🌸 Faltam poucos dias para o Dia das Mães!\n\nPrepare-se para presentear quem mais importa. ❤️\n\n#DiadasMães #Amor #Presente', criadoEm: '2026-03-20T10:30:00' },
            { id: 'cp2', titulo: 'Story — Promoção Especial', texto: '✨ PROMOÇÃO DIA DAS MÃES\n\nAté 40% OFF em peças selecionadas.\nCorra, é por tempo limitado!', criadoEm: '2026-03-20T11:00:00' },
        ],
        artes: [
            { id: 'a1', nome: 'feed_contagem_regressiva.png', tipo: 'feed', preview: null, criadoEm: '2026-03-21T14:00:00' },
            { id: 'a2', nome: 'story_promocao.png', tipo: 'story', preview: null, criadoEm: '2026-03-21T15:00:00' },
        ],
        comentarios: [
            { id: 'cm1', userId: 'u3', texto: 'Adorei a campanha! Aprovado!', criadoEm: '2026-03-22T09:00:00' },
        ],
        timeline: [
            { acao: 'Cronograma criado', userId: 'u1', data: '2026-03-20T10:00:00', tipo: 'primary' },
            { acao: 'Copys adicionadas', userId: 'u1', data: '2026-03-20T11:00:00', tipo: 'primary' },
            { acao: 'Enviado para design', userId: 'u1', data: '2026-03-20T16:00:00', tipo: 'warning' },
            { acao: 'Artes finalizadas', userId: 'u2', data: '2026-03-21T15:00:00', tipo: 'primary' },
            { acao: 'Enviado para aprovação', userId: 'u1', data: '2026-03-21T17:00:00', tipo: 'warning' },
            { acao: 'Aprovado pelo cliente', userId: 'u3', data: '2026-03-22T09:00:00', tipo: 'success' },
        ],
    },
    {
        id: 'c2',
        contaId: 'conta1',
        mesReferencia: '2026-04',
        titulo: 'Lançamento Coleção Inverno',
        descricao: 'Série de conteúdos para promover a nova coleção de inverno 2026.',
        dataInicio: '2026-04-15',
        dataFim: '2026-06-01',
        status: 'aguardando_aprovacao',
        criadoPor: 'u1',
        criadoEm: '2026-03-22T14:00:00',
        copys: [
            { id: 'cp3', titulo: 'Carousel — Nova Coleção', texto: '❄️ A nova coleção de inverno chegou!\n\nPeças quentes, estilo que aquece. Deslize para ver os destaques da temporada.\n\n#Inverno2026 #ModaInverno #NovaColecao', criadoEm: '2026-03-22T14:30:00' },
            { id: 'cp4', titulo: 'Reels — Behind the Scenes', texto: '🎬 Por trás das câmeras da nossa nova coleção!\n\nVeja como cada peça foi pensada com carinho para aquecer seu inverno.\n\n🎵 Música: Lo-fi beats', criadoEm: '2026-03-22T15:00:00' },
        ],
        artes: [
            { id: 'a3', nome: 'carousel_inverno_01.png', tipo: 'carousel', preview: null, criadoEm: '2026-03-23T10:00:00' },
        ],
        comentarios: [],
        timeline: [
            { acao: 'Cronograma criado', userId: 'u1', data: '2026-03-22T14:00:00', tipo: 'primary' },
            { acao: 'Copys adicionadas', userId: 'u1', data: '2026-03-22T15:00:00', tipo: 'primary' },
            { acao: 'Enviado para design', userId: 'u1', data: '2026-03-22T16:00:00', tipo: 'warning' },
            { acao: 'Arte parcialmente enviada', userId: 'u2', data: '2026-03-23T10:00:00', tipo: 'primary' },
            { acao: 'Enviado para aprovação do cliente', userId: 'u1', data: '2026-03-24T09:00:00', tipo: 'warning' },
        ],
    },
    {
        id: 'c3',
        contaId: 'conta2',
        mesReferencia: '2026-04',
        titulo: 'Cardápio de Inverno — Café Gourmet',
        descricao: 'Postagens para divulgar o novo cardápio de bebidas quentes do Café Gourmet.',
        dataInicio: '2026-04-01',
        dataFim: '2026-04-30',
        status: 'em_producao',
        criadoPor: 'u1',
        criadoEm: '2026-03-18T09:00:00',
        copys: [
            { id: 'cp5', titulo: 'Post Feed — Novo Cardápio', texto: '☕ O inverno chegou e trouxe sabores novos!\n\nConheça nossas bebidas quentes especiais:\n🍫 Chocolate Belga\n🍵 Chai Latte\n☕ Cappuccino Trufado\n\n#CaféGourmet #Inverno #BebidasQuentes', criadoEm: '2026-03-18T09:30:00' },
        ],
        artes: [],
        comentarios: [],
        timeline: [
            { acao: 'Cronograma criado', userId: 'u1', data: '2026-03-18T09:00:00', tipo: 'primary' },
            { acao: 'Copy adicionada', userId: 'u1', data: '2026-03-18T09:30:00', tipo: 'primary' },
            { acao: 'Enviado para design', userId: 'u1', data: '2026-03-19T10:00:00', tipo: 'warning' },
        ],
    },
    {
        id: 'c4',
        contaId: 'conta1',
        mesReferencia: '2026-10',
        titulo: 'Black Friday Antecipada',
        descricao: 'Planejamento inicial para a Black Friday com teasers e aquecimento.',
        dataInicio: '2026-10-15',
        dataFim: '2026-11-30',
        status: 'rascunho',
        criadoPor: 'u1',
        criadoEm: '2026-03-25T08:00:00',
        copys: [],
        artes: [],
        comentarios: [],
        timeline: [
            { acao: 'Cronograma criado', userId: 'u1', data: '2026-03-25T08:00:00', tipo: 'primary' },
        ],
    },
    {
        id: 'c5',
        contaId: 'conta1',
        mesReferencia: '2026-05',
        titulo: 'Campanha Dia dos Namorados',
        descricao: 'Conteúdo romântico para o Dia dos Namorados com foco em presentes.',
        dataInicio: '2026-05-20',
        dataFim: '2026-06-12',
        status: 'revisao_solicitada',
        criadoPor: 'u1',
        criadoEm: '2026-03-18T11:00:00',
        copys: [
            { id: 'cp6', titulo: 'Post Teaser', texto: '💕 O amor está no ar...\n\nEm breve, uma surpresa especial para quem ama de verdade.\n\n#DiadosNamorados #GuardaEssaData', criadoEm: '2026-03-18T11:30:00' },
        ],
        artes: [
            { id: 'a4', nome: 'teaser_namorados.png', tipo: 'feed', preview: null, criadoEm: '2026-03-19T16:00:00' },
        ],
        comentarios: [
            { id: 'cm2', userId: 'u3', texto: 'A copy está boa, mas gostaria que o visual tivesse mais tons de vermelho e rosa. O atual ficou muito neutro.', criadoEm: '2026-03-20T10:00:00' },
        ],
        timeline: [
            { acao: 'Cronograma criado', userId: 'u1', data: '2026-03-18T11:00:00', tipo: 'primary' },
            { acao: 'Copy adicionada', userId: 'u1', data: '2026-03-18T11:30:00', tipo: 'primary' },
            { acao: 'Enviado para design', userId: 'u1', data: '2026-03-18T14:00:00', tipo: 'warning' },
            { acao: 'Arte enviada', userId: 'u2', data: '2026-03-19T16:00:00', tipo: 'primary' },
            { acao: 'Enviado para aprovação', userId: 'u1', data: '2026-03-19T17:00:00', tipo: 'warning' },
            { acao: 'Revisão solicitada pelo cliente', userId: 'u3', data: '2026-03-20T10:00:00', tipo: 'danger' },
        ],
    },
];
