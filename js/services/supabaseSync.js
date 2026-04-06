// ====================================
// SOCIALFLOW — Supabase Sync Layer
// ====================================
// Camada de sincronização entre o Store (localStorage) e o Supabase.
// Estratégia: offline-first — localStorage é a fonte primária,
// Supabase é sincronizado em background.

const SupabaseSync = {
    _connected: false,

    /**
     * Verifica se o Supabase está disponível
     */
    isOnline() {
        return this._connected && getSupabase() !== null;
    },

    /**
     * Tenta conectar ao Supabase e carregar dados
     */
    async init() {
        try {
            const connected = initSupabase();
            if (!connected) {
                console.log('📴 Modo offline: usando localStorage');
                return false;
            }

            // Testar conectividade com um timeout estrito (3 segundos)
            const sb = getSupabase();
            const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Timeout de conexão')), 3000)
            );
            
            const queryPromise = sb.from('users').select('id').limit(1);
            
            const { error } = await Promise.race([queryPromise, timeoutPromise])
                .catch(err => ({ error: err }));
            
            if (error) {
                console.warn('⚠️ Supabase offline ou timeout. Usando localStorage.', error.message);
                this._connected = false;
                return false;
            }

            this._connected = true;
            console.log('🟢 Supabase Online — Sincronização ativa');
            return true;
        } catch (err) {
            console.warn('📴 Supabase offline. Usando localStorage.', err);
            this._connected = false;
            return false;
        }
    },

    /**
     * Carrega todos os dados do Supabase
     * Retorna null se falhar (para fallback ao localStorage)
     */
    async loadAll() {
        if (!this.isOnline()) return null;

        try {
            const sb = getSupabase();

            const [usersRes, contasRes, cronosRes, notifsRes] = await Promise.all([
                sb.from('users').select('*'),
                sb.from('contas').select('*'),
                sb.from('cronogramas').select('*').order('criado_em', { ascending: false }),
                sb.from('notificacoes').select('*').order('criado_em', { ascending: false }),
            ]);

            if (usersRes.error || contasRes.error || cronosRes.error || notifsRes.error) {
                console.warn('⚠️ Erro ao carregar dados do Supabase');
                return null;
            }

            // Mapear do formato Supabase para o formato do Store
            const users = (usersRes.data || []).map(this._mapUserFromDB);
            const contas = (contasRes.data || []).map(this._mapContaFromDB);
            const cronogramas = (cronosRes.data || []).map(this._mapCronogramaFromDB);
            const notificacoes = (notifsRes.data || []).map(this._mapNotificacaoFromDB);

            return { users, contas, cronogramas, notificacoes };
        } catch (err) {
            console.warn('📴 Falha ao carregar do Supabase:', err);
            return null;
        }
    },

    /**
     * Sincroniza todo o estado atual com o Supabase (upsert)
     */
    async syncAll(state) {
        if (!this.isOnline()) return;

        try {
            const sb = getSupabase();

            // Upsert em paralelo
            await Promise.all([
                this._syncUsers(sb, state.users),
                this._syncContas(sb, state.contas),
                this._syncCronogramas(sb, state.cronogramas),
                this._syncNotificacoes(sb, state.notificacoes || []),
            ]);

            console.log('☁️ Sync concluído');
        } catch (err) {
            console.warn('⚠️ Falha no sync:', err);
        }
    },

    // ==================
    // SYNC POR ENTIDADE
    // ==================

    async _syncUsers(sb, users) {
        const rows = users.map(this._mapUserToDB);
        const { error } = await sb.from('users').upsert(rows, { onConflict: 'id' });
        if (error) console.warn('Sync users error:', error.message);
    },

    async _syncContas(sb, contas) {
        const rows = contas.map(this._mapContaToDB);
        const { error } = await sb.from('contas').upsert(rows, { onConflict: 'id' });
        if (error) console.warn('Sync contas error:', error.message);
    },

    async _syncCronogramas(sb, cronogramas) {
        const rows = cronogramas.map(this._mapCronogramaToDB);
        const { error } = await sb.from('cronogramas').upsert(rows, { onConflict: 'id' });
        if (error) console.warn('Sync cronogramas error:', error.message);
    },

    async _syncNotificacoes(sb, notificacoes) {
        if (!notificacoes || notificacoes.length === 0) return;
        const rows = notificacoes.map(this._mapNotificacaoToDB);
        const { error } = await sb.from('notificacoes').upsert(rows, { onConflict: 'id' });
        if (error) console.warn('Sync notificacoes error:', error.message);
    },

    // ==================
    // MAPPERS: Store → DB
    // ==================

    _mapUserToDB(u) {
        return {
            id: u.id,
            nome: u.nome,
            email: u.email,
            senha: u.senha,
            role: u.role,
            criado_em: u.criadoEm || new Date().toISOString(),
        };
    },

    _mapContaToDB(c) {
        return {
            id: c.id,
            nome: c.nome,
            cor: c.cor || '#4F46E5',
            codigo_convite: c.codigoConvite || null,
            criado_em: c.criadoEm || new Date().toISOString(),
        };
    },

    _mapCronogramaToDB(c) {
        return {
            id: c.id,
            conta_id: c.contaId,
            mes_referencia: c.mesReferencia || null,
            titulo: c.titulo,
            descricao: c.descricao || '',
            data_inicio: c.dataInicio || null,
            status: c.status || 'rascunho',
            criado_por: c.criadoPor || null,
            criado_em: c.criadoEm || new Date().toISOString(),
            copys: JSON.stringify(c.copys || []),
            artes: JSON.stringify(c.artes || []),
            comentarios: JSON.stringify(c.comentarios || []),
            timeline: JSON.stringify(c.timeline || []),
        };
    },

    _mapNotificacaoToDB(n) {
        return {
            id: n.id,
            tipo: n.tipo,
            titulo: n.titulo,
            mensagem: n.mensagem || '',
            conteudo_id: n.conteudoId || null,
            conta_id: n.contaId || null,
            de_user_id: n.deUserId || null,
            para_role: n.paraRole || null,
            lida: n.lida || false,
            criado_em: n.criadoEm || new Date().toISOString(),
        };
    },

    // ==================
    // MAPPERS: DB → Store
    // ==================

    _mapUserFromDB(row) {
        return {
            id: row.id,
            nome: row.nome,
            email: row.email,
            senha: row.senha,
            role: row.role,
            avatar: row.avatar || '',
            status: row.status || 'pendente',
            contasIds: row.contas_ids || [],
            empresaNome: row.empresa_nome || null,
            criadoEm: row.criado_em,
        };
    },

    _mapContaFromDB(row) {
        return {
            id: row.id,
            nome: row.nome,
            cor: row.cor || '#4F46E5',
            codigoConvite: row.codigo_convite || null,
            criadoEm: row.criado_em,
        };
    },

    _mapCronogramaFromDB(row) {
        return {
            id: row.id,
            contaId: row.conta_id,
            mesReferencia: row.mes_referencia,
            titulo: row.titulo,
            descricao: row.descricao || '',
            dataInicio: row.data_inicio,
            dataFim: row.data_fim,
            status: row.status || 'rascunho',
            criadoPor: row.criado_por,
            criadoEm: row.criado_em,
            copys: typeof row.copys === 'string' ? JSON.parse(row.copys) : (row.copys || []),
            artes: typeof row.artes === 'string' ? JSON.parse(row.artes) : (row.artes || []),
            comentarios: typeof row.comentarios === 'string' ? JSON.parse(row.comentarios) : (row.comentarios || []),
            timeline: typeof row.timeline === 'string' ? JSON.parse(row.timeline) : (row.timeline || []),
        };
    },

    _mapNotificacaoFromDB(row) {
        return {
            id: row.id,
            tipo: row.tipo,
            titulo: row.titulo,
            mensagem: row.mensagem || '',
            conteudoId: row.conteudo_id,
            contaId: row.conta_id,
            deUserId: row.de_user_id,
            paraRole: row.para_role,
            lida: row.lida || false,
            criadoEm: row.criado_em,
        };
    },
};

window.SupabaseSync = SupabaseSync;
