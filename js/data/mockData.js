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
// v7.0: ZERO MOCK DATA — Todos os dados vêm exclusivamente do Supabase.
// Nenhum dado é criado automaticamente. Tudo é manual.
const INITIAL_EMPRESAS = [];

// ---- CONTAS DE CLIENTE (marcas/empresas) ----
const INITIAL_CONTAS = [];

// ---- USUÁRIOS ----
const INITIAL_USERS = [];

// ---- CRONOGRAMAS ----
const INITIAL_CRONOGRAMAS = [];
