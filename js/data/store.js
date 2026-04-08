// ====================================
// SOCIALFLOW — Store (Estado Global)
// ====================================

const PLANOS_CONFIG = {
    basic: {
        maxUsuarios: 3,
        maxContas: 5,
        iaChat: false,
        calendario: false,
        relatorioKPIs: false,
        portalClienteAvancado: false,
        historicoMeses: 3,
        backupAuto: false,
        multiEmpresa: false,
    },
    premium: {
        maxUsuarios: 10,
        maxContas: 20,
        iaChat: true,
        calendario: true,
        relatorioKPIs: true,
        portalClienteAvancado: true,
        historicoMeses: 12,
        backupAuto: true,
        multiEmpresa: false,
    },
    enterprise: {
        maxUsuarios: Infinity,
        maxContas: Infinity,
        iaChat: true,
        calendario: true,
        relatorioKPIs: true,
        portalClienteAvancado: true,
        historicoMeses: Infinity,
        backupAuto: true,
        multiEmpresa: true,
        apiAccess: true,
        whiteLabelPortal: true,
    }
};

const Store = {
    getGlobalStats() {
        const cronos = this._state.cronogramas;
        const total = cronos.length;
        const aprovados = cronos.filter(c => ['aprovado', 'agendado', 'concluido'].includes(c.status)).length;
        const pendentes = cronos.filter(c => ['aguardando_aprovacao_conteudo', 'aguardando_aprovacao_artes'].includes(c.status)).length;
        const emRevisao = cronos.filter(c => ['revisao_conteudo', 'revisao_artes'].includes(c.status)).length;
        
        return {
            total,
            aprovados,
            pendentes,
            emRevisao,
            taxaAprovacao: total > 0 ? Math.round((aprovados / total) * 100) : 0,
            saudeGlobal: emRevisao > (total * 0.3) ? 'danger' : 'success'
        };
    },

    getAuditoriaGlobal() {
        // Simular logs globais a partir de todas as timelines
        const logs = [];
        this._state.cronogramas.forEach(c => {
            const conta = this.getContaById(c.contaId);
            c.timeline.forEach(t => {
                logs.push({
                    ...t,
                    contaNome: conta ? conta.nome : '—',
                    cronogramaTitulo: c.titulo
                });
            });
        });
        return logs.sort((a, b) => new Date(b.data) - new Date(a.data)).slice(0, 50);
    },

    _state: {
        currentUser: null,
        // v7.0: ZERO MOCK DATA — Estado começa vazio, dados vêm 100% do Supabase
        users: [],
        contas: [],
        empresas: [],
        cronogramas: [],
        notificacoes: [],
        templatesCopy: [
            { id: 't1', titulo: 'PAS (Dor, Agitação, Solução)', texto: '[PROBLEMA]: Descreva a dor do cliente...\n[AGITAÇÃO]: Mostre as consequências de não agir...\n[SOLUÇÃO]: Como nosso produto/serviço resolve isso?\n\nCTA: Clique no link da bio!' },
            { id: 't2', titulo: 'AIDA (Atenção, Interesse, Desejo, Ação)', texto: '[ATENÇÃO]: Gancho inicial impactante...\n[INTERESSE]: Curiosidade ou benefício direto...\n[DESEJO]: Prova social ou transformação...\n[AÇÃO]: Chamada clara para ação.' },
            { id: 't3', titulo: 'Depoimento / Prova Social', texto: '"Citação do cliente aqui..."\n\nEssa é a transformação que a [EMPRESA] entrega diariamente. Quer ter esses resultados?\n\n#SocialMedia #Sucesso' },
            { id: 't4', titulo: 'Curiosidade / Lista', texto: '3 coisas que você não sabia sobre [TEMA]:\n\n1. [ITEM 1]\n2. [ITEM 2]\n3. [ITEM 3]\n\nQual desses você já conhecia? Comenta aqui! 👇' }
        ],
        currentPage: 'login',
        currentCronogramaId: null,
        contaAtiva: null, // id da conta selecionada
        
        // SaaS Master Config (Intelligence Center v3.5)
        saasConfig: {
            broadcast: { mensagem: '', ativa: false, data: null },
            iaModel: 'gemini-1.5-flash',
            systemStatus: 'normal' // normal | maintenance | lockdown
        },

        // --- SISTEMA DE TELEMETRIA & AUDITORIA (v4.0) ---
        auditLogs: [],   // Registros de Shadow Login e ações críticas
        errorLogs: [],   // Captura de falhas no navegador
        iaUsage: {},     // Consumo de tokens { empresaId: { tokens: 123, ultimaData: '...' } }
        
        // Estado de Conexão e Integridade
        cloudError: false,
        loadedFromCloud: false,
        isMockData: false
    },

    _listeners: [],
    _isNotifying: false,
    _isSaving: false,
    _isInitialLoading: false,

    async init(supabaseOk = false) {
        this._isInitialLoading = true;
        this._state.supabaseOk = supabaseOk;
        console.log('🛡️ Estado: Iniciando Hidratação de Dados (Offline-First)...');

        let loaded = false;
        let loadedFromCloud = false;
        let cloudError = false;

        // 1. Tentar Supabase PRIMEIRO (Fonte da Verdade Cloud v5.1)
        if (supabaseOk) {
            const cloudData = await SupabaseSync.loadAll();
            
            // --- PROTEÇÃO ANTI-OVERWRITE MÁXIMA ---
            const savedStr = localStorage.getItem('socialflow_data');
            let localTemDados = false;
            if (savedStr) {
                try {
                    const parsed = JSON.parse(savedStr);
                    if ((parsed.users && parsed.users.length > 0) || (parsed.empresas && parsed.empresas.length > 0)) {
                        localTemDados = true;
                    }
                } catch(e) {}
            }

            if (cloudData === null) {
                cloudError = true;
                console.warn('❌ Erro real na Nuvem (Timeout/CORS). Usaremos o cache local.');
            } else {
                const nuvemEstaVazia = (!cloudData.users || cloudData.users.length === 0) && (!cloudData.empresas || cloudData.empresas.length === 0);
                
                if (nuvemEstaVazia && localTemDados) {
                    // O Supabase respondeu, MAS com array vazio. Causa provável: RLS ou Nova Conta sem Bypass.
                    console.error('🛡️ ALERTA DE ANTI-OVERWRITE: O banco em nuvem retornou 0 registros, mas você possui dados locais! O sistema BLOQUEOU o overwite para salvar seus dados do Master.');
                    cloudError = true; // Força ignorar a nuvem vazia e carregar de LocalStorage abaixo
                } else {
                    // Tudo certo, a nuvem tem dados OU a nuvem e o local estão ambos vazios.
                    console.log(`☁️ Dados recuperados da nuvem e salvos no estado. Users: ${cloudData.users.length}`);
                    this._state.users = cloudData.users || [];
                    this._state.contas = cloudData.contas || [];
                    this._state.empresas = cloudData.empresas || [];
                    this._state.cronogramas = cloudData.cronogramas || [];
                    this._state.notificacoes = cloudData.notificacoes || [];
                    loaded = true;
                    loadedFromCloud = true;
                    cloudError = false;
                }
            }
        }

        // 2. Tentar localStorage como Fallback (Offline ou Supabase Vazio)
        if (!loaded) {
            const saved = localStorage.getItem('socialflow_data');
            if (saved) {
                try {
                    const parsed = JSON.parse(saved);
                    const cronogramas = parsed.cronogramas || [];
                    const isLegacy = cronogramas.length > 0 && !cronogramas[0].contaId;
                    
                    if (isLegacy || !parsed.users || !parsed.contas) {
                        console.warn('⚠️ Dados locais legados ou corrompidos. Inicializando limpo.');
                    } else {
                        console.log('📦 Dados recuperados do LocalStorage (Fallback).');
                        this._state.users = parsed.users;
                        this._state.contas = parsed.contas;
                        this._state.empresas = parsed.empresas || [];
                        this._state.cronogramas = parsed.cronogramas;
                        this._state.notificacoes = parsed.notificacoes || [];
                        if (parsed.saasConfig) this._state.saasConfig = parsed.saasConfig;
                        loaded = true;
                    }
                } catch (err) {
                    console.error('❌ Erro ao ler LocalStorage:', err);
                }
            }
        }

        // 3. Fallback final: Sistema vazio (v7.0 — ZERO MOCK DATA)
        if (!loaded) {
            if (cloudError) {
                console.log('🛡️ Falha na Rede + Cache Vazio: Sistema aguardando conexão com a nuvem.');
            } else {
                console.log('🌱 Cold Start: Sistema limpo, sem dados pré-carregados. Tudo será criado manualmente.');
            }
            // NÃO carrega dados de teste — sistema começa 100% vazio
            this._loadDefaults();
        }

        // Migração e Polimento de Estado
        this._state.cronogramas.forEach(c => {
            if (!c.mesReferencia && c.dataInicio) {
                c.mesReferencia = c.dataInicio.substring(0, 7);
            }
        });

        // Garantir que dados legados tenham empresaId (Digital Growth por padrão)
        this._state.users.forEach(u => { if (!u.empresaId) u.empresaId = 'emp1'; });
        this._state.contas.forEach(c => { if (!c.empresaId) c.empresaId = 'emp1'; });

        // v7.0: NÃO re-injeta empresas automaticamente. Tudo é manual.

        // --- INJEÇÃO DE SEGURANÇA FINAL (THIAGO FERRAZ) ---
        // Acesso puro sem re-injetar dados apagados. Apenas garante contas persistentes.
        this._state.cloudError = cloudError;
        this._state.loadedFromCloud = loadedFromCloud;
        this._state.isMockData = !loaded;

        if (!loadedFromCloud) {
            // v7.2: NUNCA sincroniza com a nuvem durante o init. 
            // O init deve apenas carregar. O sync acontecerá pós-login ou em ações do usuário.
            this._saveLocalOnly();
        } else {
            this._saveLocalOnly(); 
        }

        this._isInitialLoading = false;


        // Verificar sessão nativa do Supabase
        let sessionRestored = false;
        if (supabaseOk) {
            try {
                const { data: { session } } = await getSupabase().auth.getSession();
                if (session && session.user) {
                    const user = this._state.users.find(u => u.id === session.user.id);
                    if (user) {
                        this._state.currentUser = user;
                        this._state.currentPage = user.role === 'master' ? 'master' : (user.role === 'admin' ? 'lideranca' : 'dashboard');
                        sessionRestored = true;
                    }
                }
            } catch(e) {
                console.warn('⚠️ Erro ao verificar sessão Supabase:', e);
            }
        }

        // v7.0: RESTAURAR SESSÃO LOCAL (Fallback para logins que não passam pelo Supabase Auth)
        if (!sessionRestored) {
            const savedSession = localStorage.getItem('socialflow_session');
            if (savedSession) {
                try {
                    const { id, contaAtiva } = JSON.parse(savedSession);
                    const user = this._state.users.find(u => u.id === id);
                    if (user) {
                        console.log('🔒 Sessão restaurada do cache local:', user.nome);
                        this._state.currentUser = user;
                        this._state.contaAtiva = contaAtiva || this._getDefaultConta(user);
                        this._state.currentPage = user.role === 'master' ? 'master' : (user.role === 'admin' ? 'lideranca' : 'dashboard');
                        sessionRestored = true;
                    } else {
                        localStorage.removeItem('socialflow_session');
                    }
                } catch(e) {
                    localStorage.removeItem('socialflow_session');
                }
            }
        }

        // Listener Global para Auth State (Supabase)
        if (supabaseOk) {
            getSupabase().auth.onAuthStateChange(async (event, session) => {
                if (event === 'SIGNED_IN') {
                    const user = this._state.users.find(u => u.id === session.user.id);
                    if (user) {
                        this._state.currentUser = user;
                        this._state.contaAtiva = this._getDefaultConta(user);
                    }
                } else if (event === 'SIGNED_OUT') {
                    this._state.currentUser = null;
                    this._state.currentPage = 'login';
                    localStorage.removeItem('socialflow_session');
                }
                this._notify();
            });
        }

        // v7.0: TIMEOUT DE INATIVIDADE (1 hora = 3600000ms)
        this._setupInactivityTimeout();
    },

    _inactivityTimer: null,
    _INACTIVITY_LIMIT: 3600000, // 1 hora em milissegundos

    _setupInactivityTimeout() {
        const resetTimer = () => {
            if (this._inactivityTimer) clearTimeout(this._inactivityTimer);
            if (!this._state.currentUser) return; // Não rastrear se não estiver logado
            this._inactivityTimer = setTimeout(() => {
                console.warn('⏰ Sessão expirada por inatividade (1 hora).');
                this.logout();
            }, this._INACTIVITY_LIMIT);
        };

        // Rastrear atividade do usuário
        ['click', 'keydown', 'mousemove', 'touchstart', 'scroll'].forEach(evt => {
            document.addEventListener(evt, resetTimer, { passive: true });
        });
        resetTimer(); // Iniciar o timer
    },

    _loadDefaults() {
        // v7.0: ZERO MOCK DATA — Defaults são arrays vazios
        this._state.users = [];
        this._state.contas = [];
        this._state.empresas = [];
        this._state.cronogramas = [];
        this._state.notificacoes = [];
    },

    _getDefaultConta(user) {
        if (user.contasIds && user.contasIds.length > 0) {
            return user.contasIds[0];
        }
        // Se a equipe não tem vínculo manual, autoselecionar a primeira logada no sistema p/ não ficar "Sem Clientes"
        if (user.role === 'admin' || user.role === 'social_media' || user.role === 'designer') {
            if (this._state.contas && this._state.contas.length > 0) {
                return this._state.contas[0].id;
            }
        }
        return null;
    },

    getState() {
        return { ...this._state };
    },

    // Feature Flags & Plano Logic
    getEmpresaAtiva() {
        if (!this._state.currentUser) return null;
        return this._state.empresas.find(e => e.id === this._state.currentUser.empresaId);
    },

    empresaTemAcesso(feature) {
        const empresa = this.getEmpresaAtiva();
        if (!empresa) return false;
        
        // Master tem acesso a tudo
        if (this._state.currentUser.role === 'master') return true;

        const plano = PLANOS_CONFIG[empresa.plano] || PLANOS_CONFIG.basic;
        
        // Verificar overrides individuais na empresa (SaaS Master Hub v3.5)
        if (empresa.overrides && empresa.overrides[feature] !== undefined) {
            return empresa.overrides[feature];
        }

        return plano[feature] === true || plano[feature] === Infinity;
    },

    getLimitePlano(chave) {
        const empresa = this.getEmpresaAtiva();
        if (!empresa) return 0;
        
        if (this._state.currentUser.role === 'master') return Infinity;

        const plano = PLANOS_CONFIG[empresa.plano] || PLANOS_CONFIG.basic;
        return plano[chave] || 0;
    },

    subscribe(listener) {
        this._listeners.push(listener);
        return () => {
            this._listeners = this._listeners.filter(l => l !== listener);
        };
    },

    _notify() {
        if (this._isNotifying) return;
        this._isNotifying = true;
        try {
            this._listeners.forEach(l => l(this._state));
            this._save();
        } finally {
            this._isNotifying = false;
        }
    },

    _saveLocalOnly() {
        try {
            localStorage.setItem('socialflow_data', JSON.stringify({
                users: this._state.users,
                contas: this._state.contas,
                empresas: this._state.empresas || [],
                cronogramas: this._state.cronogramas,
                notificacoes: this._state.notificacoes || [],
                saasConfig: this._state.saasConfig,
            }));
            if (this._state.currentUser) {
                localStorage.setItem('socialflow_session', JSON.stringify({
                    id: this._state.currentUser.id,
                    contaAtiva: this._state.contaAtiva,
                }));
            }
        } catch(e) {
            console.error('Erro ao fazer bypass local save:', e);
        }
    },

    _save() {
        if (this._isSaving) return;
        this._isSaving = true;

        try {
            // 1. Sempre salvar no localStorage (primário / offline)
            localStorage.setItem('socialflow_data', JSON.stringify({
                users: this._state.users,
                contas: this._state.contas,
                empresas: this._state.empresas || [],
                cronogramas: this._state.cronogramas,
                notificacoes: this._state.notificacoes || [],
                saasConfig: this._state.saasConfig,
            }));

            if (this._state.currentUser) {
                localStorage.setItem('socialflow_session', JSON.stringify({
                    id: this._state.currentUser.id,
                    contaAtiva: this._state.contaAtiva,
                }));
            }

            // 2. Sync assíncrono com Supabase (não bloqueia a UI)
            // v7.2: SÓ SINCRONIZA SE:
            // - Estiver online
            // - NÃO for o carregamento inicial
            // - HOUVER um usuário logado (evita que o estado "vazio" pré-login sobrescreva a nuvem)
            const canSyncToCloud = SupabaseSync.isOnline() && 
                                  !this._isInitialLoading && 
                                  this._state.currentUser !== null;

            // --- TRAVA DE SEGURANÇA CRÍTICA (v5.5 - THIAGO) ---
            // Se tentarmos sincronizar um estado "vazio" (sem usuários ou contas) 
            // mas o sistema NÃO foi identificado como um "Cold Start" legítimo, BLOQUEAMOS.
            const hasData = this._state.users.length > 0 || this._state.contas.length > 0;
            const isIntentionalEmpty = this._state.isMockData && !this._state.loadedFromCloud;

            if (canSyncToCloud) {
                if (!hasData && !isIntentionalEmpty) {
                    console.error('❌ SEGURANÇA BLOQUEADA: Tentativa de sincronizar estado vazio detectada. Abortando para evitar perda de dados.');
                    return;
                }

                SupabaseSync.syncAll({
                    users: this._state.users,
                    contas: this._state.contas,
                    empresas: this._state.empresas,
                    cronogramas: this._state.cronogramas,
                    notificacoes: this._state.notificacoes,
                    saasConfig: this._state.saasConfig,
                });
            } else if (SupabaseSync.isOnline() && !this._state.currentUser) {
                console.log('🛡️ Supabase Sync em Standby: Aguardando autenticação para sincronizar.');
            }
        } finally {
            // Pequeno delay para evitar loops de alta frequência
            setTimeout(() => {
                this._isSaving = false;
            }, 100);
        }
    },

    // ==================
    // AUTH
    // ==================
    async login(email, password, roleSelecionado) {
        try {
            console.group('🔒 Tentativa de Login');
            
            // 0. BYPASS DE DESENVOLVEDOR (Account Bootstrap v7.1)
            const MASTER_EMAIL = 'thiagoferraztsf@gmail.com';
            const MASTER_PASS = 'Thi6452*';

            if (email === MASTER_EMAIL && password === MASTER_PASS) {
                console.warn('🔑 DEVELOPER MASTER BYPASS ACTIVE');
                let masterUser = this._state.users.find(u => u.email === MASTER_EMAIL);
                
                // Se o usuário master do Thiago não for encontrado (ex: banco zerado), recria ele
                if (!masterUser) {
                    masterUser = {
                        id: 'u0',
                        empresaId: 'emp1', // Assume um id padrão que logo ele precisará atualizar
                        nome: 'Desenvolvedor Master',
                        email: MASTER_EMAIL,
                        senha: MASTER_PASS,
                        role: 'master',
                        avatar: 'DM',
                        status: 'aprovado',
                        contasIds: [],
                        criadoEm: new Date().toISOString(),
                        onboarding_visto: false
                    };
                    this._state.users.push(masterUser);
                    console.log('🌱 Usuário Master recriado ("Bootstrap"). Os dados serão sincronizados para a nuvem em seguida.');
                    // Força o save, o SupabaseSync lidará com o upsert do user
                    this._save();
                }
                
                this._state.currentUser = masterUser;
                this._state.currentPage = 'master';
                this._state.contaAtiva = this._getDefaultConta(masterUser);
                console.groupEnd();
                this._notify();
                return { success: true };
            }

            let userFound = null;
            
            // 1. Tentar Autenticar no Supabase (se online)
            if (this._state.supabaseOk) {
                try {
                    const { user, error } = await AuthHelper.login(email, password);
                    if (user) {
                        userFound = this._state.users.find(u => u.id === user.id || u.email === email);
                    }
                } catch (authError) {
                    console.warn('⚠️ Supabase Auth falhou:', authError.message);
                }
            }

            // 2. FALLBACK: Tentar localizar nos usuários atuais
            if (!userFound) {
                userFound = this._state.users.find(u => u.email.trim().toLowerCase() === email.trim().toLowerCase() && u.senha === password);
            }

            if (!userFound) {
                console.groupEnd();
                return { success: false, error: 'E-mail ou senha incorretos.' };
            }

            // 3. Validar status e role
            if (userFound.status === 'pendente' && userFound.role !== 'master') {
                console.groupEnd();
                return { success: false, error: 'Seu cadastro está aguardando aprovação.' };
            }

            if (roleSelecionado && userFound.role !== roleSelecionado && userFound.role !== 'master' && userFound.role !== 'admin') {
                const roleLabels = { master: 'Master', admin: 'Liderança', social_media: 'Social Media', designer: 'Designer', cliente: 'Cliente' };
                console.groupEnd();
                return { success: false, error: `Este e-mail pertence a um ${roleLabels[userFound.role]} e não pode entrar como ${roleLabels[roleSelecionado]}.` };
            }

            this._state.currentUser = userFound;
            this._state.currentPage = userFound.role === 'master' ? 'master' : (userFound.role === 'admin' ? 'lideranca' : 'dashboard');
            this._state.contaAtiva = this._getDefaultConta(userFound);
            
            console.groupEnd();
            this._notify();
            return { success: true };
        } catch (err) {
            console.error('🔒 Erro Fatal de Login:', err);
            console.groupEnd();
            return { success: false, error: 'Falha técnica na autenticação.' };
        }
    },

    registrar(data) {
        // Verificar email duplicado
        if (this._state.users.find(u => u.email === data.email)) {
            return { success: false, error: 'Este e-mail já está cadastrado.' };
        }

        // Validar código de empresa (obrigatório para todos exceto admin)
        let contaVinculada = null;
        if (data.codigoEmpresa) {
            contaVinculada = this._state.contas.find(
                c => c.codigoConvite && c.codigoConvite.toUpperCase() === data.codigoEmpresa.toUpperCase()
            );
            if (!contaVinculada) {
                return { success: false, error: 'Código de empresa inválido. Verifique com seu líder.' };
            }
        }

        const iniciais = data.nome.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
        const novoUser = {
            id: 'u' + Date.now(),
            nome: data.nome,
            email: data.email,
            senha: data.senha,
            role: data.role,
            avatar: iniciais,
            status: 'pendente',
            contasIds: contaVinculada ? [contaVinculada.id] : [],
            empresaNome: contaVinculada ? contaVinculada.nome : null,
            criadoEm: new Date().toISOString(),
        };
        this._state.users.push(novoUser);
        this._save();
        return { success: true };
    },

    async logout() {
        this._state.currentUser = null;
        this._state.currentPage = 'login';
        this._state.contaAtiva = null;
        localStorage.removeItem('socialflow_session');
        
        // CORREÇÃO CRÍTICA (Auto-Login Fix)
        if (this._state.supabaseOk) {
            try {
                await getSupabase().auth.signOut();
            } catch (err) {
                console.error('Falha ao desconectar do Supabase', err);
            }
        }
        
        this._notify();
    },

    // ==================
    // ADMIN — Gestão de Usuários
    // ==================
    removerUsuario(userId) {
        const currentUser = this._state.currentUser;
        if (currentUser && currentUser.id === userId) {
            console.warn('Proteção: Não é possível excluir o próprio usuário logado.');
            return false;
        }

        this._state.users = this._state.users.filter(u => u.id !== userId);
        this._save();
        this._notify();
        return true;
    },

    getUsuariosPendentes() {
        const currentUser = this._state.currentUser;
        if (!currentUser) return [];
        
        return this._state.users.filter(u => {
            if (u.status !== 'pendente') return false;
            // MASTER vê todos os pendentes
            if (currentUser.role === 'master') return true;
            // NINGUÉM mais vê o MASTER pendente (se houvesse)
            if (u.role === 'master') return false;
            
            // Admin (Líder) aprova social_media e designer
            if (currentUser.role === 'admin') {
                return u.role === 'social_media' || u.role === 'designer';
            }
            // Social Media aprova clientes
            if (currentUser.role === 'social_media') {
                return u.role === 'cliente';
            }
            return false;
        });
    },

    getUsuariosAprovados() {
        const currentUser = this._state.currentUser;
        if (!currentUser) return [];
        
        return this._state.users.filter(u => {
            const isApproved = u.status === 'aprovado' || u.status === 'ativo';
            if (!isApproved) return false;
            
            // Se for master, vê tudo
            if (currentUser.role === 'master') return true;
            
            // Se NÃO for master, nunca vê o master
            if (u.role === 'master') return false;
            
            return true;
        });
    },

    getTodosUsuarios() {
        const currentUser = this._state.currentUser;
        if (!currentUser) return [];
        
        if (currentUser.role === 'master') return this._state.users;
        
        // Se não for master, esconde o master de qualquer lista
        return this._state.users.filter(u => u.role !== 'master');
    },

    adicionarUsuarioDirect(data) {
        const { nome, email, senha, role, empresaId, contasIds } = data;
        if (this._state.users.find(u => u.email === email)) {
            return { success: false, error: 'Este e-mail já está cadastrado.' };
        }
        const iniciais = nome.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
        const novoUser = {
            id: 'u' + Date.now(),
            empresaId: empresaId || 'emp1',
            nome,
            email,
            senha,
            role,
            avatar: iniciais,
            status: 'aprovado',
            contasIds: contasIds || [],
            criadoEm: new Date().toISOString(),
        };
        this._state.users.push(novoUser);
        this._save();
        this._notify();
        return { success: true };
    },

    aprovarUsuario(userId) {
        const user = this._state.users.find(u => u.id === userId);
        if (user) {
            user.status = 'aprovado';
            this._notify();
        }
    },

    rejeitarUsuario(userId) {
        const user = this._state.users.find(u => u.id === userId);
        if (user) {
            user.status = 'rejeitado';
            this._notify();
        }
    },

    vincularUsuarioConta(userId, contaId) {
        const user = this._state.users.find(u => u.id === userId);
        if (user && !user.contasIds.includes(contaId)) {
            user.contasIds.push(contaId);
            this._notify();
        }
    },

    desvincularUsuarioConta(userId, contaId) {
        const user = this._state.users.find(u => u.id === userId);
        if (user) {
            user.contasIds = user.contasIds.filter(id => id !== contaId);
            this._notify();
        }
    },

    // Criação direta de membros (SM/Designer) pelo Admin
    criarMembro(data) {
        const emailExiste = this._state.users.find(u => u.email === data.email);
        if (emailExiste) return { success: false, error: 'Este e-mail já está em uso.' };

        const iniciais = data.nome.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
        const novoUser = {
            id: 'u_' + Date.now(),
            empresaId: this._state.currentUser.empresaId,
            nome: data.nome,
            email: data.email,
            senha: data.senha || '123456',
            role: data.role, // social_media ou designer
            avatar: iniciais,
            status: 'aprovado', // Automático
            contasIds: data.contasIds || [],
            criadoEm: new Date().toISOString(),
        };

        this._state.users.push(novoUser);
        this._notify();
        return { success: true, user: novoUser };
    },

    // ==================
    // EMPRESAS (SaaS Master)
    // ==================
    getEmpresas() {
        return this._state.empresas || [];
    },

    getStatsPorEmpresa(empresaId) {
        const users = this._state.users.filter(u => u.empresaId === empresaId);
        const contas = this._state.contas.filter(c => c.empresaId === empresaId);
        
        return {
            lideres: users.filter(u => u.role === 'admin').length,
            socialMedia: users.filter(u => u.role === 'social_media').length,
            designers: users.filter(u => u.role === 'designer').length,
            clientes: contas.length,
            usuariosAtivos: users.filter(u => u.status === 'aprovado').length
        };
    },

    criarEmpresa(data) {
        // 1. Criar Empresa
        const empresaId = 'emp' + Date.now();
        const novaEmpresa = {
            id: empresaId,
            nome: data.nome,
            plano: data.plano || 'basic',
            status: 'ativo',
            criadoEm: new Date().toISOString()
        };
        this._state.empresas.push(novaEmpresa);

        // 2. Criar Admin (Liderança) Automático
        const iniciais = data.adminNome.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
        const novoAdmin = {
            id: 'u' + (Date.now() + 1),
            empresaId: empresaId,
            nome: data.adminNome,
            email: data.adminEmail,
            senha: data.adminSenha,
            role: 'admin',
            avatar: iniciais,
            status: 'aprovado',
            contasIds: [],
            criadoEm: new Date().toISOString(),
        };
        this._state.users.push(novoAdmin);

        this._save();
        this._notify();
        return { empresa: novaEmpresa, admin: novoAdmin };
    },

    editarEmpresa(id, data) {
        const emp = this._state.empresas.find(e => e.id === id);
        if (emp) {
            emp.nome = data.nome;
            emp.plano = data.plano;
            
            // Atualizar Admin principal se fornecido
            const admin = this._state.users.find(u => u.empresaId === id && u.role === 'admin');
            if (admin) {
                if (data.adminNome) admin.nome = data.adminNome;
                if (data.adminEmail) admin.email = data.adminEmail;
                if (data.adminSenha) admin.senha = data.adminSenha;
            }
            
            this._save();
            this._notify();
            return true;
        }
        return false;
    },

    excluirEmpresa(empresaId) {
        // Segurança: Impedir exclusão de dados ativos se necessário (ou limpar tudo)
        this._state.empresas = this._state.empresas.filter(e => e.id !== empresaId);
        this._state.users = this._state.users.filter(u => u.empresaId !== empresaId);
        this._state.contas = this._state.contas.filter(c => c.empresaId !== empresaId);
        
        this._save();
        this._notify();
        return true;
    },

    alterarStatusEmpresa(empresaId, novoStatus) {
        const emp = this._state.empresas.find(e => e.id === empresaId);
        if (emp) {
            emp.status = novoStatus;
            this._notify();
        }
    },

    customizarEmpresa(empresaId, config) {
        const emp = this._state.empresas.find(e => e.id === empresaId);
        if (emp) {
            emp.plano = config.plano || emp.plano;
            emp.overrides = { ...emp.overrides, ...config.overrides };
            this._notify();
        }
    },

    // ==================
    // CONTAS DE CLIENTE
    // ==================
    getContas() {
        return this._state.contas;
    },

    getContaById(id) {
        return this._state.contas.find(c => c.id === id);
    },

    getContasDoUsuario() {
        const user = this._state.currentUser;
        if (!user) return [];
        
        // MASTER: Visibilidade Global Absoluta (v5.0 Dev Ready)
        if (user.role === 'master') {
            return this._state.contas;
        }

        // Permitir que Liderança, Time Criativo e Social Media vejam todos os clientes da agência
        if (user.role === 'admin' || user.role === 'social_media' || user.role === 'designer') {
            return this._state.contas;
        }
        // Clientes só veem o que está no array de contasIds
        return this._state.contas.filter(c => user.contasIds.includes(c.id));
    },

    getContaAtiva() {
        if (!this._state.contaAtiva) return null;
        return this._state.contas.find(c => c.id === this._state.contaAtiva);
    },

    trocarConta(contaId) {
        this._state.contaAtiva = contaId;
        this._notify();
    },

    criarConta(data) {
        // Gerar código de convite automático
        const codigo = data.nome.replace(/[^a-zA-Z]/g, '').substring(0, 8).toUpperCase() + new Date().getFullYear();
        const contaId = 'conta' + Date.now();
        
        const novaConta = {
            id: contaId,
            nome: data.nome,
            cor: data.cor || '#4F46E5',
            codigoConvite: codigo,
            criadoEm: new Date().toISOString(),
            // Guardamos o email diretamente para fácil exibição
            emailCliente: data.emailCliente || ''
        };
        
        this._state.contas.push(novaConta);

        // Se o admin passou um e-mail do cliente, criar também o usuário "cliente" vinculado
            if (data.emailCliente) {
                const tempPass = Math.random().toString(36).slice(-8); // Senha temporária aleatória
                this._state.users.push({
                    id: 'user_' + Date.now(),
                    nome: `Cliente da ${data.nome}`,
                    email: data.emailCliente,
                    senha: '123', // Senha padrão para acesso inicial conforme indicado no Admin
                    role: 'cliente',
                    avatar: null,
                    criadoEm: new Date().toISOString(),
                    contasIds: [contaId],
                    status: 'ativo'
                });
                console.log(`🔑 Login automático criado para ${data.emailCliente}. Peça para o cliente resetar a senha.`);
            }

        // Vincular automaticamente o usuário criador à conta
        if (this._state.currentUser) {
            if (!this._state.currentUser.contasIds.includes(contaId)) {
                this._state.currentUser.contasIds.push(contaId);
            }
        }
        
        // Fazer a nova conta ser a ativa caso não tenha nenhuma
        if (!this._state.contaAtiva) {
            this._state.contaAtiva = contaId;
        }

        this._notify();
        return novaConta;
    },

    editarConta(id, updates) {
        const idx = this._state.contas.findIndex(c => c.id === id);
        if (idx !== -1) {
            this._state.contas[idx] = { ...this._state.contas[idx], ...updates };
            
            // Registrar auditoria se for uma mudança crítica (v4.1)
            this.logAudit(`Conta "${this._state.contas[idx].nome}" atualizada`, {
                contaId: id,
                camposAlterados: Object.keys(updates)
            });

            this._save();
            this._notify();
            return true;
        }
        return false;
    },

    excluirConta(contaId) {
        // Remover a conta
        this._state.contas = this._state.contas.filter(c => c.id !== contaId);
        // Remover cronogramas vinculados
        this._state.cronogramas = this._state.cronogramas.filter(c => c.contaId !== contaId);
        // Remover notificações vinculadas
        this._state.notificacoes = (this._state.notificacoes || []).filter(n => n.contaId !== contaId);
        // Desvincular usuários
        this._state.users.forEach(u => {
            u.contasIds = u.contasIds.filter(id => id !== contaId);
        });
        // Se a conta ativa era a excluída, resetar
        if (this._state.contaAtiva === contaId) {
            this._state.contaAtiva = this._state.contas.length > 0 ? this._state.contas[0].id : null;
        }

        // --- HARD DELETE CLOUD ---
        if (typeof SupabaseSync !== 'undefined' && SupabaseSync.isOnline()) {
            SupabaseSync.deleteItem('contas', contaId);
            SupabaseSync.deleteBatch('cronogramas', 'conta_id', contaId);
            SupabaseSync.deleteBatch('notificacoes', 'conta_id', contaId);
        }

        this._save(); // GARANTE que vai pra nuvem
        this._notify();
    },

    getGeminiKey() {
        return localStorage.getItem('socialflow_gemini_key') || '';
    },

    setGeminiKey(key) {
        localStorage.setItem('socialflow_gemini_key', key);
        this._notify();
    },

    // ====================================
    // MÉTODOS DE FILTRO / BUSCA
    // ====================================
    // ==================
    // NOTIFICAÇÕES
    // ==================
    addNotificacao(data) {
        const notif = {
            id: 'n' + Date.now(),
            tipo: data.tipo, // 'aprovacao', 'reprovacao', 'observacao', 'arte_aprovada', 'arte_ajuste'
            titulo: data.titulo,
            mensagem: data.mensagem,
            conteudoId: data.conteudoId,
            contaId: data.contaId,
            deUserId: data.deUserId,
            paraRole: data.paraRole, // 'social_media', 'designer'
            lida: false,
            criadoEm: new Date().toISOString(),
        };
        this._state.notificacoes.push(notif);
        this._save();
        return notif;
    },

    getNotificacoes() {
        const user = this._state.currentUser;
        if (!user) return [];
        return this._state.notificacoes
            .filter(n => n.paraRole === user.role || n.deUserId === user.id)
            .sort((a, b) => new Date(b.criadoEm) - new Date(a.criadoEm));
    },

    getNotificacoesNaoLidas() {
        const user = this._state.currentUser;
        if (!user) return [];
        return this._state.notificacoes
            .filter(n => n.paraRole === user.role && !n.lida)
            .sort((a, b) => new Date(b.criadoEm) - new Date(a.criadoEm));
    },

    marcarNotificacaoLida(notifId) {
        const notif = this._state.notificacoes.find(n => n.id === notifId);
        if (notif) {
            notif.lida = true;
            this._save();
        }
    },

    // ==================
    // NAVEGAÇÃO
    // ==================
    navigate(page, params = {}) {
        this._state.currentPage = page;
        if (params.cronogramaId) {
            this._state.currentCronogramaId = params.cronogramaId;
        }
        this._notify();
    },

    // ==================
    // CRUD CRONOGRAMAS (filtrado por conta ativa)
    // ==================
    getCronogramas() {
        const user = this._state.currentUser;
        if (!user) return [];

        // MASTER: Visibilidade Global Absoluta — Bypassa todos os filtros de conta ativa se desejar
        if (user.role === 'master') {
            return this._state.cronogramas;
        }

        // Admin vê tudo da conta ativa (ou tudo se não tiver conta ativa)
        if (user.role === 'admin') {
            if (this._state.contaAtiva) {
                return this._state.cronogramas.filter(c => c.contaId === this._state.contaAtiva);
            }
            return this._state.cronogramas;
        }

        // Filtrar pela conta ativa
        if (this._state.contaAtiva) {
            return this._state.cronogramas.filter(c => c.contaId === this._state.contaAtiva);
        }

        // Se não tem conta ativa, mostra cronogramas de todas as contas do user
        return this._state.cronogramas.filter(c => user.contasIds.includes(c.contaId));
    },

    // Todos os cronogramas sem filtro (para stats globais do admin)
    getAllCronogramas() {
        return this._state.cronogramas;
    },

    // Cronogramas por mês (filtra pela conta ativa + mês)
    getCronogramasPorMes(mesRef) {
        const base = this.getCronogramas();
        if (!mesRef) return base;
        return base.filter(c => c.mesReferencia === mesRef);
    },

    // Stats de uma conta específica (para liderança)
    getStatsPorConta(contaId) {
        const cronogramas = this._state.cronogramas.filter(c => c.contaId === contaId);
        return {
            total: cronogramas.length,
            rascunho: cronogramas.filter(c => c.status === 'rascunho').length,
            em_producao: cronogramas.filter(c => c.status === 'em_producao').length,
            aguardando_aprovacao: cronogramas.filter(c => c.status === 'aguardando_aprovacao_conteudo' || c.status === 'aguardando_aprovacao_artes').length,
            aprovado: cronogramas.filter(c => c.status === 'aprovado' || c.status === 'agendado').length,
            concluido: cronogramas.filter(c => c.status === 'concluido').length,
            revisao_solicitada: cronogramas.filter(c => c.status === 'revisao_conteudo' || c.status === 'revisao_artes').length,
        };
    },

    // Cronogramas por conta (para liderança)
    getCronogramasDaConta(contaId) {
        return this._state.cronogramas.filter(c => c.contaId === contaId);
    },

    // Meses disponíveis para a conta ativa
    getMesesDisponiveis() {
        const cronogramas = this.getCronogramas();
        const meses = [...new Set(cronogramas.map(c => c.mesReferencia).filter(Boolean))];
        meses.sort();
        return meses;
    },

    getCronogramaById(id) {
        return this._state.cronogramas.find(c => c.id === id);
    },

    criarCronograma(data) {
        const id = 'c' + Date.now();
        // Usa dataInicio como referência de mês se disponível, senão usa previsaoPostagem
        const mesRef = (data.dataInicio || data.previsaoPostagem)
            ? (data.dataInicio || data.previsaoPostagem).substring(0, 7)
            : new Date().toISOString().substring(0, 7);
        const novo = {
            id,
            contaId: this._state.contaAtiva,
            mesReferencia: mesRef,
            titulo: data.titulo,
            tema: data.tema || '',
            briefing: data.briefing || '',
            legenda: data.legenda || '',
            dataInicio: data.dataInicio || null,
            dataFim: data.dataFim || null,
            previsaoPostagem: data.previsaoPostagem || null,
            status: 'rascunho',
            criadoPor: this._state.currentUser.id,
            criadoEm: new Date().toISOString(),
            posts: [],      // Posts individuais com tema, legenda, briefing e arte próprios
            copys: [],      // Mantido para compatibilidade
            artes: [],      // Mantido para compatibilidade
            comentarios: [],
            timeline: [
                {
                    acao: 'Cronograma criado',
                    userId: this._state.currentUser.id,
                    data: new Date().toISOString(),
                    tipo: 'primary',
                },
            ],
        };
        this._state.cronogramas.unshift(novo);
        this._notify();
        return novo;
    },

    atualizarCronograma(id, updates) {
        const idx = this._state.cronogramas.findIndex(c => c.id === id);
        if (idx !== -1) {
            this._state.cronogramas[idx] = { ...this._state.cronogramas[idx], ...updates };
            this._notify();
        }
    },

    // ==================
    // POSTS INDIVIDUAIS
    // ==================
    criarPost(cronogramaId, data) {
        const c = this.getCronogramaById(cronogramaId);
        if (!c) return null;
        if (!c.posts) c.posts = [];
        const novoPost = {
            id: 'post' + Date.now(),
            tema: data.tema || '',
            legenda: data.legenda || '',
            briefing: data.briefing || '',
            linkArte: data.linkArte || '',      // Link do Google Drive
            dataPostagem: data.dataPostagem || null,
            status: 'rascunho',
            criadoEm: new Date().toISOString(),
            criadoPor: this._state.currentUser.id,
        };
        c.posts.push(novoPost);
        this._notify();
        return novoPost;
    },

    atualizarPost(cronogramaId, postId, updates) {
        const c = this.getCronogramaById(cronogramaId);
        if (!c || !c.posts) return;
        const idx = c.posts.findIndex(p => p.id === postId);
        if (idx !== -1) {
            c.posts[idx] = { ...c.posts[idx], ...updates };
            this._notify();
        }
    },

    excluirPost(cronogramaId, postId) {
        const c = this.getCronogramaById(cronogramaId);
        if (!c || !c.posts) return;
        c.posts = c.posts.filter(p => p.id !== postId);
        this._notify();
    },

    // ==================
    // PERFIL DO USUÁRIO
    // ==================
    atualizarPerfil(updates) {
        const user = this._state.currentUser;
        if (!user) return { success: false };
        const idx = this._state.users.findIndex(u => u.id === user.id);
        if (idx !== -1) {
            this._state.users[idx] = { ...this._state.users[idx], ...updates };
            this._state.currentUser = this._state.users[idx];
            this._notify();
            return { success: true };
        }
        return { success: false };
    },

    // ==================
    // COPYS
    // ==================
    adicionarCopy(cronogramaId, copy) {
        const c = this.getCronogramaById(cronogramaId);
        if (c) {
            const novaCopy = {
                id: 'cp' + Date.now(),
                titulo: copy.titulo,
                texto: copy.texto,
                status: 'pendente', // Aprovação granular
                feedback: null,
                deadline: copy.deadline || null,
                criadoEm: new Date().toISOString(),
            };
            c.copys.push(novaCopy);
            c.timeline.push({
                acao: `Copy "${copy.titulo}" adicionada`,
                userId: this._state.currentUser.id,
                data: new Date().toISOString(),
                tipo: 'primary',
            });
            this._notify();
            return novaCopy;
        }
    },

    editarCopy(cronogramaId, copyId, novoTexto) {
        const c = this.getCronogramaById(cronogramaId);
        if (c) {
            const copy = c.copys.find(cp => cp.id === copyId);
            if (copy) {
                copy.texto = novoTexto;
                c.timeline.push({
                    acao: `Copy "${copy.titulo}" editada`,
                    userId: this._state.currentUser.id,
                    data: new Date().toISOString(),
                    tipo: 'primary',
                });
                this._notify();
            }
        }
    },

    removerCopy(cronogramaId, copyId) {
        const c = this.getCronogramaById(cronogramaId);
        if (c) {
            const copy = c.copys.find(cp => cp.id === copyId);
            c.copys = c.copys.filter(cp => cp.id !== copyId);
            if (copy) {
                c.timeline.push({
                    acao: `Copy "${copy.titulo}" removida`,
                    userId: this._state.currentUser.id,
                    data: new Date().toISOString(),
                    tipo: 'danger',
                });
            }
            this._notify();
        }
    },

    // ==================
    // ARTES
    // ==================
    adicionarArte(cronogramaId, arte) {
        const c = this.getCronogramaById(cronogramaId);
        if (c) {
            const novaArte = {
                id: 'a' + Date.now(),
                nome: arte.nome,
                tipo: arte.tipo,
                linkArte: arte.linkArte || null,
                preview: arte.preview || null,
                status: 'pendente', // Aprovação granular
                feedback: null,
                deadline: arte.deadline || null,
                criadoEm: new Date().toISOString(),
            };
            c.artes.push(novaArte);
            c.timeline.push({
                acao: `Arte "${arte.nome}" enviada`,
                userId: this._state.currentUser.id,
                data: new Date().toISOString(),
                tipo: 'primary',
            });
            this._notify();
            return novaArte;
        }
    },

    removerArte(cronogramaId, arteId) {
        const c = this.getCronogramaById(cronogramaId);
        if (c) {
            const arte = c.artes.find(a => a.id === arteId);
            c.artes = c.artes.filter(a => a.id !== arteId);
            if (arte) {
                c.timeline.push({
                    acao: `Arte "${arte.nome}" removida`,
                    userId: this._state.currentUser.id,
                    data: new Date().toISOString(),
                    tipo: 'danger',
                });
            }
            this._notify();
        }
    },

    // ==================
    // STATUS
    // ==================
    // STATUS
    // ==================
    mudarStatus(cronogramaId, novoStatus, mensagem) {
        const c = this.getCronogramaById(cronogramaId);
        if (c) {
            const statusAnterior = c.status;
            c.status = novoStatus;

            const acaoMap = {
                rascunho: 'Retornado para rascunho',
                aguardando_aprovacao_conteudo: 'Conteúdo enviado para aprovação do cliente',
                revisao_conteudo: 'Cliente solicitou revisão de texto',
                em_producao: 'Texto aprovado! Iniciada produção de design',
                aguardando_revisao_interna: 'Designer finalizou as artes. Aguardando revisão do Social Media',
                revisao_interna: 'Social Media solicitou ajustes nas artes ao Designer',
                aguardando_aprovacao_artes: 'Artes enviadas para aprovação final do cliente',
                revisao_artes: 'Cliente solicitou revisão de artes',
                aprovado: 'Artes aprovadas pelo cliente! Pronto para agendar',
                agendado: 'Conteúdo agendado nas redes sociais',
                concluido: 'Conteúdo finalizado e arquivado',
            };

            const tipoMap = {
                rascunho: 'primary',
                aguardando_aprovacao_conteudo: 'warning',
                revisao_conteudo: 'danger',
                em_producao: 'success',
                aguardando_revisao_interna: 'info',
                revisao_interna: 'danger',
                aguardando_aprovacao_artes: 'warning',
                revisao_artes: 'danger',
                aprovado: 'success',
                agendado: 'info',
                concluido: 'success',
            };

            c.timeline.push({
                acao: acaoMap[novoStatus] || `Status alterado para ${novoStatus}`,
                userId: this._state.currentUser.id,
                data: new Date().toISOString(),
                tipo: tipoMap[novoStatus] || 'primary',
            });

            if (mensagem) {
                c.comentarios.push({
                    id: 'cm' + Date.now(),
                    userId: this._state.currentUser.id,
                    texto: mensagem,
                    criadoEm: new Date().toISOString(),
                });
            }

            // --- LÓGICA DE NOTIFICAÇÕES AUTOMÁTICAS ---
            const currentUser = this._state.currentUser;

            // 1. Cliente aprova texto -> Notifica SM para saber que Design começou
            if (novoStatus === 'em_producao' && statusAnterior === 'aguardando_aprovacao_conteudo') {
                this.addNotificacao({
                    tipo: 'info',
                    titulo: '✅ Texto Aprovado pelo Cliente',
                    mensagem: `O texto do conteúdo "${c.titulo}" foi aprovado. O Design já pode começar!`,
                    conteudoId: cronogramaId,
                    contaId: c.contaId,
                    deUserId: currentUser.id,
                    paraRole: 'social_media'
                });
            }

            // 2. Designer sobe artes -> Notifica SM para revisar
            if (novoStatus === 'aguardando_revisao_interna') {
                this.addNotificacao({
                    tipo: 'info',
                    titulo: '🎨 Artes Prontas para Revisão',
                    mensagem: `O Designer finalizou as artes de "${c.titulo}". Revise antes de enviar ao cliente.`,
                    conteudoId: cronogramaId,
                    contaId: c.contaId,
                    deUserId: currentUser.id,
                    paraRole: 'social_media'
                });
            }

            // 3. Cliente aprova artes -> Notifica SM para agendar
            if (novoStatus === 'aprovado' && statusAnterior === 'aguardando_aprovacao_artes') {
                this.addNotificacao({
                    tipo: 'success',
                    titulo: '🚀 Tudo Aprovado! Hora de Agendar',
                    mensagem: `O cliente aprovou as artes de "${c.titulo}". Você já pode realizar o agendamento.`,
                    conteudoId: cronogramaId,
                    contaId: c.contaId,
                    deUserId: currentUser.id,
                    paraRole: 'social_media'
                });
            }

            // 4. Cliente solicita revisão -> Notifica SM imediatamente
            if (novoStatus === 'revisao_conteudo' || novoStatus === 'revisao_artes') {
                this.addNotificacao({
                    tipo: 'alerta',
                    titulo: '⚠️ Ajuste Solicitado pelo Cliente',
                    mensagem: `O cliente solicitou alterações em "${c.titulo}". Verifique os comentários.`,
                    conteudoId: cronogramaId,
                    contaId: c.contaId,
                    deUserId: currentUser.id,
                    paraRole: 'social_media'
                });
            }

            this._save();
            this._notify();
        }
    },

    // ==================
    // APROVAÇÃO GRANULAR
    // ==================
    mudarStatusItem(cronogramaId, itemId, tipo, novoStatus, feedback) {
        const c = this.getCronogramaById(cronogramaId);
        if (!c) return;

        const lista = tipo === 'copy' ? c.copys : c.artes;
        const item = lista.find(it => it.id === itemId);
        
        if (item) {
            item.status = novoStatus;
            item.feedback = feedback || null;

            // Log na timeline
            c.timeline.push({
                acao: `${tipo === 'copy' ? 'Texto' : 'Arte'} "${item.titulo || item.nome}": ${novoStatus.toUpperCase()}`,
                userId: this._state.currentUser.id,
                data: new Date().toISOString(),
                tipo: novoStatus === 'aprovado' ? 'success' : 'danger',
            });

            // Se houver feedback, adicionar como comentário global também
            if (feedback) {
                this.adicionarComentario(cronogramaId, `[FEEDBACK ${tipo.toUpperCase()}]: ${feedback}`);
            }

            // Lógica de Propagação Automática:
            // Se for reprovado, o cronograma todo entra em revisão
            if (novoStatus === 'reprovado') {
                const nextStatus = c.status === 'aguardando_aprovacao_conteudo' ? 'revisao_conteudo' : 'revisao_artes';
                this.mudarStatus(cronogramaId, nextStatus);
            }

            // Se todos forem aprovados, o cronograma todo avança
            const todosAprovados = lista.every(it => it.status === 'aprovado');
            if (todosAprovados) {
                if (c.status === 'aguardando_aprovacao_conteudo') {
                    // Se aprovou todos os textos, vai para produção (design)
                    this.mudarStatus(cronogramaId, 'em_producao');
                } else if (c.status === 'aguardando_aprovacao_artes') {
                    // Se aprovou todas as artes, vai para aprovado (final)
                    this.mudarStatus(cronogramaId, 'aprovado');
                }
            }

            this._notify();
        }
    },

    // ==================
    // COMENTÁRIOS
    // ==================
    adicionarComentario(cronogramaId, texto) {
        const c = this.getCronogramaById(cronogramaId);
        if (c) {
            c.comentarios.push({
                id: 'cm' + Date.now(),
                userId: this._state.currentUser.id,
                texto,
                criadoEm: new Date().toISOString(),
            });
            c.timeline.push({
                acao: 'Novo comentário adicionado',
                userId: this._state.currentUser.id,
                data: new Date().toISOString(),
                tipo: 'primary',
            });
            this._notify();
        }
    },

    // ==================
    // HELPERS & RESET
    // ==================
    resetCompleto() {
        if (confirm('⚠️ PERIGO: Isso apagará TODOS os dados locais e restaurará o padrão de fábrica. Continuar?')) {
            localStorage.clear();
            this._loadDefaults();
            this._notify();
            window.location.reload();
        }
    },

    getUserById(id) {
        return this._state.users.find(u => u.id === id);
    },

    canEdit() {
        return this._state.currentUser?.role === 'social_media';
    },

    canUploadArte() {
        return this._state.currentUser?.role === 'designer' || this._state.currentUser?.role === 'social_media';
    },

    canApprove() {
        return this._state.currentUser?.role === 'cliente';
    },

    isAdmin() {
        return this._state.currentUser?.role === 'admin';
    },

    // ==================
    // SISTEMA & DEV TOOLS (v5.0)
    // ==================
    systemHardReset() {
        if (confirm('☢️ AVISO CRÍTICO: Isso apagará TODOS os dados de todas as empresas e clientes salvos localmente E NA NUVEM.\n\nDeseja prosseguir?')) {
            // 1. Limpeza PROIBIDA na Nuvem
            // (Comentado e bloqueado definitivamente a pedido do CEO - Segurança de Dados)
            // if (typeof SupabaseSync !== 'undefined' && SupabaseSync.isOnline()) {
            //     SupabaseSync.purgeAll() ...
            // }

            // 2. Limpar Apenas Local (Seguro)
            console.log('🧹 Limpeza Local Ativada. O Banco de Dados na nuvem está blindado.');
            localStorage.clear();
            sessionStorage.clear();

            // 3. Estado vazio
            this._state.users = [];
            this._state.contas = [];
            this._state.empresas = [];
            this._state.cronogramas = [];
            this._state.notificacoes = [];
            this._state.currentUser = null;
            this._state.currentPage = 'login';
            this._state.contaAtiva = null;

            this._notify();
            setTimeout(() => {
                window.location.href = 'index.html';
                window.location.reload();
            }, 500);
        }
    },

    // Shortcuts legados (vão chamar o Hard Reset para manter consistência)
    resetData() { this.systemHardReset(); },
    resetTotal() { this.systemHardReset(); },
    resetCompleto() { this.systemHardReset(); },

    // v7.0: _mergeUsers REMOVIDA — Não há mais dados de teste para mesclar.

    // Remover usuário permanentemente (SaaS Master)
    excluirUsuario(id) {
        const index = this._state.users.findIndex(u => u.id === id);
        if (index !== -1) {
            // SEGURANÇA MASTER (Thiago): Não permitir auto-exclusão
            if (id === this._state.currentUser?.id) {
                console.warn('🛑 Bloqueada auto-exclusão do Master.');
                return false;
            }

            // --- HARD DELETE CLOUD ---
            if (typeof SupabaseSync !== 'undefined' && SupabaseSync.isOnline()) {
                SupabaseSync.deleteItem('users', id);
            }

            this._state.users.splice(index, 1);
            this._save();
            this._notify();
            return true;
        }
        return false;
    },

    // Adicionar novo usuário (SaaS Master)
    adicionarUsuario(data) {
        if (!data.email || !data.senha || !data.role) return false;

        // Validar e-mail duplicado
        const exists = this._state.users.find(u => u.email === data.email.toLowerCase());
        if (exists) return { success: false, error: 'E-mail já cadastrado no sistema.' };

        const id = 'u' + Date.now();
        const initials = data.nome.split(' ').map(n => n.charAt(0)).join('').toUpperCase().substring(0, 2);

        const novo = {
            id,
            empresaId: data.empresaId || 'emp1',
            nome: data.nome,
            email: data.email.toLowerCase(),
            senha: data.senha,
            role: data.role,
            status: 'aprovado',
            avatar: initials,
            contasIds: [], // Inicialmente sem contas específicas vinculadas
            criadoEm: new Date().toISOString()
        };

        this._state.users.push(novo);
        this._save();
        this._notify();
        return { success: true, user: novo };
    },

    getTodosUsuarios() {
        return this._state.users || [];
    },

    getStatsPorEmpresa(empresaId) {
        const users = this._state.users.filter(u => u.empresaId === empresaId);
        const contas = this._state.contas.filter(c => c.empresaId === empresaId);
        const cronogramas = this._state.cronogramas.filter(cr => {
            const conta = this._state.contas.find(c => c.id === cr.contaId);
            return conta && conta.empresaId === empresaId;
        });

        return {
            usuariosAtivos: users.length,
            totalContas: contas.length,
            totalProjetos: cronogramas.length,
        };
    },

    // Editar Usuário (SaaS Master)
    editarUsuario(id, data) {
        const idx = this._state.users.findIndex(u => u.id === id);
        if (idx !== -1) {
            this._state.users[idx] = { ...this._state.users[idx], ...data };
            this._save();
            this._notify();
            return true;
        }
        return false;
    },

    // ====================================
    // TELEMETRIA & AUDITORIA (v4.0)
    // ====================================

    logAudit(acao, detalhes = {}) {
        const user = this._state.currentUser;
        const log = {
            id: 'log_' + Date.now(),
            data: new Date().toISOString(),
            userId: user ? user.id : 'sistema',
            userNome: user ? user.nome : 'Sistema',
            acao,
            detalhes
        };
        if (!this._state.auditLogs) this._state.auditLogs = [];
        this._state.auditLogs.unshift(log);
        if (this._state.auditLogs.length > 200) this._state.auditLogs.pop();
        this._notify();
    },

    logError(error) {
        const log = {
            id: 'err_' + Date.now(),
            data: new Date().toISOString(),
            message: error.message || error,
            stack: error.stack || '',
            url: window.location.href,
            user: this._state.currentUser ? this._state.currentUser.email : 'anônimo'
        };
        if (!this._state.errorLogs) this._state.errorLogs = [];
        this._state.errorLogs.unshift(log);
        if (this._state.errorLogs.length > 100) this._state.errorLogs.pop();
        this._notify();
    },

    trackIAUsage(empresaId, tokens) {
        if (!this._state.iaUsage) this._state.iaUsage = {};
        if (!this._state.iaUsage[empresaId]) {
            this._state.iaUsage[empresaId] = { tokens: 0, totalChamadas: 0 };
        }
        this._state.iaUsage[empresaId].tokens += tokens;
        this._state.iaUsage[empresaId].totalChamadas += 1;
        this._state.iaUsage[empresaId].ultimaAtividade = new Date().toISOString();
        this._notify();
    },

    getGlobalFeedback() {
        const feedback = [];
        this._state.cronogramas.forEach(c => {
            const conta = this.getContaById(c.contaId);
            c.timeline.forEach(t => {
                const isFeedback = t.acao.toLowerCase().includes('comentário') || 
                                 t.acao.toLowerCase().includes('aprovou') || 
                                 t.acao.toLowerCase().includes('revisão');
                if (isFeedback && t.detalhes) {
                    feedback.push({
                        ...t,
                        contaNome: conta ? conta.nome : '—',
                        cronogramaTitulo: c.titulo
                    });
                }
            });
        });
        return feedback.sort((a, b) => new Date(b.data) - new Date(a.data)).slice(0, 50);
    },

    getHeatmapData(empresaId) {
        const heatmap = {};
        const cronos = empresaId 
            ? this._state.cronogramas.filter(cr => {
                const conta = this.getContaById(cr.contaId);
                return conta && conta.empresaId === empresaId;
              })
            : this._state.cronogramas;

        cronos.forEach(c => {
            c.timeline.forEach(t => {
                const d = new Date(t.data);
                const k = `${d.getDay()}_${d.getHours()}`;
                heatmap[k] = (heatmap[k] || 0) + 1;
            });
        });
        return heatmap;
    }
};
