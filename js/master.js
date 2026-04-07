// ====================================
// SOCIALFLOW — SaaS Master Hub (Intelligence Center v3.0)
// ====================================

const MasterPanel = {
    _state: {
        mfaVerified: true, // Bypass MFA for Master as requested
        activeTab: 'metricas', // Default tab is now Metrics
        searchQuery: '',
    },

    async init() {
        console.log('🛡️ Inicializando SaaS Intelligence Center...');
        const supabaseOk = await SupabaseSync.init();
        await Store.init(supabaseOk);
        this.render();
    },

    render() {
        const app = document.getElementById('app');
        const user = Store.getState().currentUser;

        if (!user || user.role !== 'master') {
            this.renderLogin(app);
            return;
        }

        this.renderDashboard(app);
    },

    renderLogin(app) {
        app.innerHTML = `
            <div style="height:100vh; display:flex; align-items:center; justify-content:center; background:var(--gray-900);">
                <div class="card" style="width:400px; padding:var(--space-8); background:var(--gray-800); border:1px solid var(--gray-700); text-align:center;">
                    <div style="width:64px; height:64px; border-radius:16px; background:linear-gradient(135deg, var(--primary), var(--primary-dark)); margin:0 auto var(--space-6); display:flex; align-items:center; justify-content:center; color:white;">
                        ${Icons.shield || '🛡️'}
                    </div>
                    <h2 style="color:white; font-weight:800; margin-bottom:8px;">Intelligence Center</h2>
                    <p style="color:var(--gray-400); font-size:14px; margin-bottom:var(--space-8);">Autenticação Master de Segurança</p>
                    
                    <div class="form-group" style="text-align:left;">
                        <label class="form-label" style="color:var(--gray-400);">E-mail Admin</label>
                        <input type="email" id="master-email" class="form-input" style="background:var(--gray-900); border-color:var(--gray-700); color:white;" placeholder="administrador@socialflow.com">
                    </div>

                    <div class="form-group" style="text-align:left;">
                        <label class="form-label" style="color:var(--gray-400);">Senha</label>
                        <input type="password" id="master-pass" class="form-input" style="background:var(--gray-900); border-color:var(--gray-700); color:white;" placeholder="••••••••">
                    </div>
                    
                    <button class="btn btn-primary" onclick="MasterPanel.handleLogin()" style="width:100%; justify-content:center; height:48px; margin-top:16px;">
                        Entrar no Hub
                    </button>
                </div>
            </div>
        `;
    },

    renderDashboard(app) {
        app.innerHTML = `
            <div style="min-height: 100vh; display: flex; flex-direction: column; background: var(--gray-950);">
                <!-- Header Master -->
                <header style="background:var(--gray-900); border-bottom:1px solid var(--gray-800); padding:12px var(--space-8); display:flex; justify-content:space-between; align-items:center;">
                    <div style="display:flex; align-items:center; gap:16px;">
                        <div style="background:var(--primary); padding:8px; border-radius:8px;">${Icons.shield || '🛡️'}</div>
                        <div style="display:none; @media(min-width:768px){display:block;}">
                            <span style="display:block; color:white; font-weight:700; font-size:14px;">Intelligence Center</span>
                            <span style="display:flex; align-items:center; gap:4px; color:var(--success); font-size:11px;">
                                <span style="width:6px; height:6px; border-radius:50%; background:var(--success);"></span> Sistema Estável
                            </span>
                        </div>
                    </div>

                    <div style="flex:1; max-width:400px; margin:0 40px; position:relative;">
                        <input type="text" placeholder="Buscar empresa, usuário ou projeto..." 
                            value="${this._state.searchQuery}"
                            style="width:100%; height:36px; background:var(--gray-800); border:1px solid var(--gray-700); border-radius:18px; padding-left:40px; color:white; font-size:13px; outline:none;"
                            onkeyup="MasterPanel.handleSearch(this.value)">
                        <div style="position:absolute; left:14px; top:10px; color:var(--gray-500);">${Icons.search || '🔍'}</div>
                    </div>

                    <nav style="display:flex; gap:24px;">
                        ${this._renderNavLink('Métricas', 'metricas')}
                        ${this._renderNavLink('Empresas', 'empresas')}
                        ${this._renderNavLink('Usuários', 'usuarios')}
                        ${this._renderNavLink('Feedback', 'feedback')}
                        ${this._renderNavLink('Saúde', 'saude')}
                        ${this._renderNavLink('IA', 'ia')}
                        ${this._renderNavLink('Sistema', 'sistema')}
                        ${this._renderNavLink('Faturamento', 'faturamento')}
                        ${this._renderNavLink('Auditoria', 'auditoria')}
                    </nav>
                    <button class="btn btn-danger btn-sm" onclick="MasterPanel.logout()">Sair</button>
                </header>

                <main style="flex:1; padding: var(--space-8); max-width: 1400px; margin: 0 auto; width:100%;">
                    ${this._renderActiveTab()}
                </main>

                <!-- Assinatura Thiago Schimidt -->
                <div style="position:fixed; bottom:12px; right:24px; font-size:10px; color:var(--gray-600); opacity:1; z-index:9999; pointer-events:none; font-weight:600; letter-spacing:0.05em; text-transform:uppercase;">
                    Desenvolvido por Thiago Schimidt
                </div>
            </div>
        `;
    },

    _renderNavLink(label, tab) {
        const active = this._state.activeTab === tab;
        return `<a href="#" onclick="MasterPanel.switchTab('${tab}')" style="color:${active ? 'var(--primary)' : 'var(--gray-400)'}; text-decoration:none; font-weight:${active ? '700' : '400'}; font-size:14px;">${label}</a>`;
    },

    _renderActiveTab() {
        switch (this._state.activeTab) {
            case 'metricas': return this._renderMetrics();
            case 'empresas': return this._renderEmpresas();
            case 'usuarios': return this._renderUsuarios();
            case 'feedback': return this._renderFeedback();
            case 'saude': return this._renderSaude();
            case 'ia': return this._renderIAUsage();
            case 'sistema': return this._renderSistema();
            case 'faturamento': return this._renderFaturamento();
            case 'comunicacao': return this._renderComunicacao();
            case 'auditoria': return this._renderAuditoria();
            default: return this._renderMetrics();
        }
    },

    _renderMetrics() {
        const stats = Store.getGlobalStats();
        return `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:32px;">
                <h2 style="color:white; font-size:24px; font-weight:800;">Estatísticas do Ecossistema</h2>
                <div style="color:var(--gray-500); font-size:12px;">Monitorando ${Store.getEmpresas().length} agências ativas.</div>
            </div>

            <div class="dashboard-stats" style="display:grid; grid-template-columns: repeat(4, 1fr); gap:20px; margin-bottom:40px;">
                <div class="card" style="background:var(--gray-900); padding:24px; border:1px solid var(--gray-800);">
                    <div style="color:var(--gray-500); font-size:12px; margin-bottom:8px;">CRONOGRAMAS TOTAIS</div>
                    <div style="color:white; font-size:32px; font-weight:800;">${stats.total}</div>
                </div>
                <div class="card" style="background:var(--gray-900); padding:24px; border:1px solid var(--gray-800);">
                    <div style="color:var(--gray-500); font-size:12px; margin-bottom:8px;">TAXA DE APROVAÇÃO</div>
                    <div style="color:white; font-size:32px; font-weight:800;">${stats.taxaAprovacao}%</div>
                </div>
                <div class="card" style="background:var(--gray-900); padding:24px; border:1px solid var(--gray-800);">
                    <div style="color:var(--gray-500); font-size:12px; margin-bottom:8px;">AGUARDANDO CLIENTE</div>
                    <div style="color:var(--warning); font-size:32px; font-weight:800;">${stats.pendentes}</div>
                </div>
                <div class="card" style="background:var(--gray-900); padding:24px; border:1px solid var(--gray-800);">
                    <div style="color:var(--gray-500); font-size:12px; margin-bottom:8px;">EM REVISÃO (AJUSTES)</div>
                    <div style="color:var(--danger); font-size:32px; font-weight:800;">${stats.emRevisao}</div>
                </div>
            </div>

            <div style="display:grid; grid-template-columns: 2fr 1fr; gap:32px;">
                <div class="card" style="background:var(--gray-900); padding:32px; min-height:400px; display:flex; flex-direction:column; justify-content:center; align-items:center; text-align:center;">
                    <div style="font-size:48px; margin-bottom:16px;">📈</div>
                    <h3 style="color:white;">Painel de Tendência</h3>
                    <p style="color:var(--gray-500);">O volume de produção aumentou 12% nos últimos 7 dias.</p>
                </div>
                <div class="card" style="background:var(--gray-900); padding:24px; border:1px solid var(--gray-800);">
                    <h4 style="color:white; margin-bottom:16px;">Saúde Global</h4>
                    <div style="height:120px; width:120px; border-radius:50%; border:8px solid ${stats.saudeGlobal === 'success' ? 'var(--success)' : 'var(--danger)'}; margin: 20px auto; display:flex; align-items:center; justify-content:center;">
                        <span style="color:white; font-weight:800; font-size:24px;">${stats.saudeGlobal === 'success' ? 'A+' : 'C'}</span>
                    </div>
                    <p style="font-size:12px; color:var(--gray-400); text-align:center;">Baseado na taxa de ajustes solicitados pela base de clientes.</p>
                </div>
            </div>
        `;
    },

    _renderAuditoria() {
        const logs = Store.getAuditoriaGlobal();
        return `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:32px;">
                <h2 style="color:white; font-size:24px; font-weight:800;">Log de Auditoria Global</h2>
                <div style="font-size:12px; color:var(--gray-500);">Últimos 50 eventos</div>
            </div>
            
            <div class="card" style="background:var(--gray-900); padding:24px; border:1px solid var(--gray-800);">
                ${logs.length > 0 ? logs.map(log => Security.html`
                    <div style="padding:16px 0; border-bottom:1px solid var(--gray-800); display:flex; justify-content:space-between; align-items:center;">
                        <div>
                            <span style="color:var(--primary); font-weight:700; font-size:11px; display:block; text-transform:uppercase;">${log.contaNome || 'Sistema'}</span>
                            <span style="color:white; font-weight:500; font-size:14px;">${log.acao}</span>
                            <span style="color:var(--gray-500); font-size:12px; margin-left:8px;">${log.cronogramaTitulo ? `em "${log.cronogramaTitulo}"` : ''}</span>
                        </div>
                        <div style="color:var(--gray-600); font-size:12px; text-align:right;">
                            ${formatDateRelative(log.data)}
                        </div>
                    </div>
                `).join('') : '<p style="color:var(--gray-500); text-align:center; padding:40px;">Nenhum log encontrado.</p>'}
            </div>
        `;
    },

    _renderEmpresas() {
        let empresas = Store.getEmpresas();
        if (this._state.searchQuery) {
            empresas = empresas.filter(e => e.nome.toLowerCase().includes(this._state.searchQuery));
        }

        return `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:32px;">
                <h2 style="color:white; font-size:24px; font-weight:800;">Ecossistema Global</h2>
                <button class="btn btn-primary" onclick="MasterPanel.abrirModalNovaEmpresa()">${Icons.plus || '+'} Nova Empresa</button>
            </div>
            
            <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap:24px;">
                ${empresas.map(emp => this._renderEmpresaCard(emp)).join('')}
            </div>
        `;
    },

    _renderEmpresaCard(emp) {
        const stats = Store.getStatsPorEmpresa(emp.id);
        const color = emp.status === 'ativo' ? 'var(--success)' : 'var(--danger)';
        const healthScore = stats.totalProjetos > 0 ? 'A' : '—';
        
        return Security.html`
            <div class="card" style="background:var(--gray-800); border:1px solid var(--gray-700); opacity:${emp.status === 'ativo' ? 1 : 0.7}; transition:all 0.2s;" onmouseover="this.style.borderColor='var(--primary)'" onmouseout="this.style.borderColor='var(--gray-700)'">
                <div style="padding:20px; border-bottom:1px solid var(--gray-700); display:flex; justify-content:space-between; align-items:center;">
                    <div>
                        <h3 style="color:white; font-size:18px; font-weight:700; margin:0;">${emp.nome || 'Empresa Sem Nome'}</h3>
                        <div style="font-size:10px; color:var(--gray-500); text-transform:uppercase;">ID: ${emp.id || '—'}</div>
                    </div>
                    <div style="text-align:right;">
                        <span style="font-size:10px; padding:2px 8px; border-radius:20px; border:1px solid ${color}; color:${color}; font-weight:700;">${emp.status.toUpperCase()}</span>
                        <div style="font-size:20px; font-weight:900; color:var(--success); margin-top:4px;">${healthScore}</div>
                    </div>
                </div>
                <div style="padding:20px; display:grid; grid-template-columns:1fr 1fr; gap:16px;">
                    <div style="font-size:12px; color:var(--gray-400);">Plano: <b style="color:white;">${emp.plano.toUpperCase()}</b></div>
                    <div style="font-size:12px; color:var(--gray-400);">Projetos: <b style="color:white;">${stats.totalProjetos || 0}</b></div>
                    <div style="font-size:12px; color:var(--gray-400);">Usuários: <b style="color:white;">${stats.usuariosAtivos} / ${emp.config_limite_usuarios || 5}</b></div>
                    <div style="font-size:12px; color:var(--gray-400);">Uso IA: <b style="color:white;">${Math.round(Math.random()*80)}%</b></div>
                </div>
                <div style="padding:16px; background:rgba(0,0,0,0.1); display:flex; gap:8px;">
                    <button class="btn btn-warning btn-sm" style="flex:1.5; font-size:11px;" onclick="MasterPanel.impersonateAdmin('${emp.id}')">Shadow Login</button>
                    <button class="btn btn-outline btn-sm" style="flex:1; font-size:11px; border-color:var(--gray-700); color:white;" onclick="MasterPanel.abrirModalEditarEmpresa('${emp.id}')">Editar</button>
                    <button class="btn btn-danger btn-sm" style="flex:0.8; font-size:11px;" onclick="MasterPanel.confirmarExcluirEmpresa('${emp.id}', '${emp.nome}')">Excluir</button>
                </div>
            </div>
        `;
    },

    _renderUsuarios() {
        let users = Store.getTodosUsuarios();
        if (this._state.searchQuery) {
            users = users.filter(u => u.nome.toLowerCase().includes(this._state.searchQuery) || u.email.toLowerCase().includes(this._state.searchQuery));
        }
        const empresas = Store.getEmpresas();

        return `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:32px;">
                <h2 style="color:white; font-size:24px; font-weight:800;">Operadores do Sistema</h2>
                <button class="btn btn-primary" onclick="MasterPanel.abrirModalNovoUsuario()">${Icons.plus || '+'} Novo Usuário</button>
            </div>
            
            <div class="card" style="background:var(--gray-900); border:1px solid var(--gray-800); overflow:hidden;">
                <table style="width:100%; border-collapse:collapse; color:white; font-size:14px;">
                    <thead>
                        <tr style="background:var(--gray-800); text-align:left;">
                            <th style="padding:16px;">Usuário</th>
                            <th style="padding:16px;">Cargo</th>
                            <th style="padding:16px;">Empresa</th>
                            <th style="padding:16px;">Status</th>
                            <th style="padding:16px; text-align:right;">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${users.map(u => {
                            const emp = empresas.find(e => e.id === u.empresaId);
                            // Usar Security.html para sanitizar dados do usuário
                            return Security.html`
                                <tr style="border-bottom:1px solid var(--gray-800);">
                                    <td style="padding:16px;">
                                        <div style="display:flex; align-items:center; gap:12px;">
                                            <div style="width:32px; height:32px; border-radius:50%; background:var(--primary); display:flex; align-items:center; justify-content:center; font-size:12px; font-weight:700;">${u.avatar}</div>
                                            <div>
                                                <span style="font-weight:600; display:block;">${u.nome || 'Usuário'}</span>
                                                <span style="font-size:11px; color:var(--gray-500);">${u.email || 'sem-email'}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td style="padding:16px;"><span class="badge badge-info">${u.role.toUpperCase()}</span></td>
                                    <td style="padding:16px;">${emp ? emp.nome : '—'}</td>
                                    <td style="padding:16px;"><span class="badge badge-success">${u.status}</span></td>
                                    <td style="padding:16px; text-align:right;">
                                        <button class="btn btn-outline btn-sm" onclick="MasterPanel.abrirModalEditarUsuario('${u.id}')" style="margin-right:8px; border-color:var(--gray-700); color:white;">Editar</button>
                                        <button class="btn btn-danger btn-sm" onclick="MasterPanel.confirmarRemoverUsuario('${u.id}', '${u.nome}')">Excluir</button>
                                    </td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        `;
    },

    handleSearch(q) {
        this._state.searchQuery = q.toLowerCase();
        this.render();
    },

    switchTab(tab) {
        this._state.activeTab = tab;
        this.render();
    },

    async handleLogin() {
        const email = document.getElementById('master-email').value.trim().toLowerCase();
        const pass = document.getElementById('master-pass').value.trim();

        const res = await Store.login(email, pass, 'master');
        if (res.success) {
            this.render();
        } else {
            showToast(res.error, 'danger');
        }
    },

    logout() {
        Store.logout();
        this.render();
    },

    abrirModalNovaEmpresa() {
        const body = `
            <div style="display:flex; flex-direction:column; gap:20px;">
                <div style="padding-bottom:12px; border-bottom:1px solid var(--gray-800);">
                    <h4 style="color:var(--primary); font-size:12px; text-transform:uppercase; margin-bottom:12px;">Dados da Agência</h4>
                    <div class="form-group">
                        <label class="form-label" style="color:var(--gray-400);">Nome da Agência</label>
                        <input type="text" id="ne-nome" class="form-input" style="background:var(--gray-900); color:white;" placeholder="Ex: Agência Digital X">
                    </div>
                    <div class="form-group">
                        <label class="form-label" style="color:var(--gray-400);">Plano Master</label>
                        <select id="ne-plano" class="form-input" style="background:var(--gray-900); color:white;">
                            <option value="basic">Basic (Até 3 users)</option>
                            <option value="premium" selected>Premium (Até 10 users)</option>
                            <option value="enterprise">Enterprise (Ilimitado)</option>
                        </select>
                    </div>
                </div>

                <div>
                    <h4 style="color:var(--primary); font-size:12px; text-transform:uppercase; margin-bottom:12px;">Dados de Liderança (Admin Principal)</h4>
                    <div class="form-group">
                        <label class="form-label" style="color:var(--gray-400);">Nome do Líder</label>
                        <input type="text" id="ne-admin-nome" class="form-input" style="background:var(--gray-900); color:white;" placeholder="Ex: Thiago Ferraz">
                    </div>
                    <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px;">
                        <div class="form-group">
                            <label class="form-label" style="color:var(--gray-400);">E-mail de Acesso</label>
                            <input type="email" id="ne-admin-email" class="form-input" style="background:var(--gray-900); color:white;" placeholder="admin@agencia.com">
                        </div>
                        <div class="form-group">
                            <label class="form-label" style="color:var(--gray-400);">Senha Inicial</label>
                            <input type="password" id="ne-admin-senha" class="form-input" style="background:var(--gray-900); color:white;" placeholder="••••••••">
                        </div>
                    </div>
                </div>
            </div>
        `;
        const footer = `
            <button class="btn btn-secondary" onclick="closeModal('modal-nova-empresa')">Cancelar</button>
            <button class="btn btn-primary" onclick="MasterPanel.confirmarCriarEmpresa()">
                ${Icons.plus || '+'} Criar Ecossistema
            </button>
        `;
        showModal('modal-nova-empresa', 'Registrar Nova Empresa SaaS', body, footer);
    },

    confirmarCriarEmpresa() {
        const data = {
            nome: document.getElementById('ne-nome').value.trim(),
            plano: document.getElementById('ne-plano').value,
            adminNome: document.getElementById('ne-admin-nome').value.trim(),
            adminEmail: document.getElementById('ne-admin-email').value.trim().toLowerCase(),
            adminSenha: document.getElementById('ne-admin-senha').value.trim()
        };

        if (!data.nome || !data.adminNome || !data.adminEmail || !data.adminSenha) {
            return showToast('Por favor, preencha todos os campos obrigatórios.', 'warning');
        }

        const res = Store.criarEmpresa(data);
        if (res) {
            closeModal('modal-nova-empresa');
            showToast(`Agência "${data.nome}" criada com sucesso!`, 'success');
            this.render();
        }
    },

    abrirModalEditarEmpresa(id) {
        const emp = Store.getEmpresas().find(e => e.id === id);
        const admin = Store.getState().users.find(u => u.empresaId === id && u.role === 'admin') || {};
        
        const body = `
            <div style="display:flex; flex-direction:column; gap:20px;">
                <div class="form-group">
                    <label class="form-label" style="color:var(--gray-400);">Nome da Agência</label>
                    <input type="text" id="ee-nome" class="form-input" style="background:var(--gray-900); color:white;" value="${emp.nome}">
                </div>
                <div class="form-group">
                    <label class="form-label" style="color:var(--gray-400);">Plano</label>
                    <select id="ee-plano" class="form-input" style="background:var(--gray-900); color:white;">
                        <option value="basic" ${emp.plano === 'basic' ? 'selected' : ''}>Basic</option>
                        <option value="premium" ${emp.plano === 'premium' ? 'selected' : ''}>Premium</option>
                        <option value="enterprise" ${emp.plano === 'enterprise' ? 'selected' : ''}>Enterprise</option>
                    </select>
                </div>
                <hr style="border-color:var(--gray-800); margin:8px 0;">
                <h4 style="color:var(--primary); font-size:12px; text-transform:uppercase;">Dados de Acesso Admin</h4>
                <div class="form-group">
                    <label class="form-label" style="color:var(--gray-400);">Nome do Administrador</label>
                    <input type="text" id="ee-admin-nome" class="form-input" style="background:var(--gray-900); color:white;" value="${admin.nome || ''}">
                </div>
                <div class="form-group">
                    <label class="form-label" style="color:var(--gray-400);">E-mail</label>
                    <input type="email" id="ee-admin-email" class="form-input" style="background:var(--gray-900); color:white;" value="${admin.email || ''}">
                </div>
                <div class="form-group">
                    <label class="form-label" style="color:var(--gray-400);">Senha de Acesso</label>
                    <input type="text" id="ee-admin-senha" class="form-input" style="background:var(--gray-900); color:white;" value="${admin.senha || ''}">
                </div>
            </div>
        `;
        const footer = `
            <button class="btn btn-secondary" onclick="closeModal('modal-edit-emp')">Cancelar</button>
            <button class="btn btn-primary" onclick="MasterPanel.confirmarEditarEmpresa('${id}')">Salvar Alterações</button>
        `;
        showModal('modal-edit-emp', 'Editar Acesso da Agência', body, footer);
    },

    confirmarEditarEmpresa(id) {
        const data = {
            nome: document.getElementById('ee-nome').value.trim(),
            plano: document.getElementById('ee-plano').value,
            adminNome: document.getElementById('ee-admin-nome').value.trim(),
            adminEmail: document.getElementById('ee-admin-email').value.trim(),
            adminSenha: document.getElementById('ee-admin-senha').value.trim()
        };

        if (Store.editarEmpresa(id, data)) {
            closeModal('modal-edit-emp');
            showToast('Dados da agência atualizados!', 'success');
            this.render();
        }
    },

    confirmarExcluirEmpresa(id, nome) {
        if (confirm(`⚠️ CUIDADO: Você está prestes a excluir PERMANENTEMENTE a agência "${nome}", todos os seus usuários, cronogramas e dados.\n\nDeseja prosseguir?`)) {
            Store.excluirEmpresa(id);
            showToast(`Agência "${nome}" excluída.`, 'info');
            this.render();
        }
    },

    abrirCustomizacaoEmpresa(id) {
        const emp = Store.getEmpresas().find(e => e.id === id);
        const body = `<p style="color:var(--gray-600);">Configurações avançadas para <b>${emp.nome}</b>. Em breve.</p>`;
        const footer = `<button class="btn btn-secondary" onclick="closeModal('modal-custom')">Fechar</button>`;
        showModal('modal-custom', 'Customizar Agência', body, footer);
    },

    async impersonateAdmin(empresaId) {
        const users = Store.getState().users.filter(u => u.empresaId === empresaId && u.role === 'admin');
        if (users.length === 0) return alert('Nenhum administrador encontrado nesta empresa.');
        
        const target = users[0];
        if (confirm(`Shadow Login como [${target.nome}]? Todas as suas ações serão logadas.`)) {
            // Log de Auditoria Master (v4.0)
            Store.logAudit('Shadow Login', { 
                targetId: target.id, 
                targetNome: target.nome, 
                empresaId 
            });

            Store._state.currentUser = target;
            Store._state.currentPage = 'lideranca';
            Store._notify();
            window.location.href = 'index.html';
        }
    },

    abrirModalNovoUsuario() {
        const empresas = Store.getEmpresas();
        const body = `
            <div style="display:flex; flex-direction:column; gap:16px;">
                <div class="form-group">
                    <label class="form-label" style="color:var(--gray-400);">Nome Completo</label>
                    <input type="text" id="nu-nome" class="form-input" style="background:var(--gray-900); color:white;" placeholder="Ex: Ana Souza">
                </div>
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px;">
                    <div class="form-group">
                        <label class="form-label" style="color:var(--gray-400);">E-mail de Login</label>
                        <input type="email" id="nu-email" class="form-input" style="background:var(--gray-900); color:white;" placeholder="ana@exemplo.com">
                    </div>
                    <div class="form-group">
                        <label class="form-label" style="color:var(--gray-400);">Senha</label>
                        <input type="text" id="nu-senha" class="form-input" style="background:var(--gray-900); color:white;" placeholder="123456">
                    </div>
                </div>
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px;">
                    <div class="form-group">
                        <label class="form-label" style="color:var(--gray-400);">Cargo / Permissão</label>
                        <select id="nu-role" class="form-input" style="background:var(--gray-900); color:white;">
                            <option value="admin">Administrador (Líder)</option>
                            <option value="social_media" selected>Social Media (Operacional)</option>
                            <option value="designer">Designer (Produção)</option>
                            <option value="cliente">Cliente (Aprovação)</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label" style="color:var(--gray-400);">Vincular à Agência</label>
                        <select id="nu-empresaId" class="form-input" style="background:var(--gray-900); color:white;">
                            ${empresas.map(emp => `
                                <option value="${emp.id}">${emp.nome}</option>
                            `).join('')}
                        </select>
                    </div>
                </div>
            </div>
        `;
        const footer = `
            <button class="btn btn-secondary" onclick="closeModal('modal-novo-user')">Cancelar</button>
            <button class="btn btn-primary" onclick="MasterPanel.confirmarCriarUsuario()">Criar Acesso</button>
        `;
        showModal('modal-novo-user', 'Registrar Novo Operador', body, footer);
    },

    confirmarCriarUsuario() {
        const data = {
            nome: document.getElementById('nu-nome').value.trim(),
            email: document.getElementById('nu-email').value.trim(),
            senha: document.getElementById('nu-senha').value.trim(),
            role: document.getElementById('nu-role').value,
            empresaId: document.getElementById('nu-empresaId').value
        };

        if (!data.nome || !data.email || !data.senha) {
            return showToast('Preencha os campos obrigatórios!', 'warning');
        }

        const res = Store.adicionarUsuario(data);
        if (res.success) {
            closeModal('modal-novo-user');
            showToast(`Usuário ${data.nome} criado com sucesso!`, 'success');
            this.render();
        } else {
            showToast(res.error, 'danger');
        }
    },

    abrirModalEditarUsuario(id) {
        const u = Store.getState().users.find(u => u.id === id);
        const empresas = Store.getEmpresas();
        if (!u) return;

        const body = `
            <div style="display:flex; flex-direction:column; gap:16px;">
                <div class="form-group">
                    <label class="form-label" style="color:var(--gray-400);">Nome Completo</label>
                    <input type="text" id="eu-nome" class="form-input" style="background:var(--gray-900); color:white;" value="${u.nome}">
                </div>
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px;">
                    <div class="form-group">
                        <label class="form-label" style="color:var(--gray-400);">E-mail de Login</label>
                        <input type="email" id="eu-email" class="form-input" style="background:var(--gray-900); color:white;" value="${u.email}">
                    </div>
                    <div class="form-group">
                        <label class="form-label" style="color:var(--gray-400);">Senha</label>
                        <input type="text" id="eu-senha" class="form-input" style="background:var(--gray-900); color:white;" value="${u.senha}">
                    </div>
                </div>
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px;">
                    <div class="form-group">
                        <label class="form-label" style="color:var(--gray-400);">Cargo / Permissão</label>
                        <select id="eu-role" class="form-input" style="background:var(--gray-900); color:white;">
                            <option value="admin" ${u.role === 'admin' ? 'selected' : ''}>Administrador</option>
                            <option value="social_media" ${u.role === 'social_media' ? 'selected' : ''}>Social Media</option>
                            <option value="designer" ${u.role === 'designer' ? 'selected' : ''}>Designer</option>
                            <option value="cliente" ${u.role === 'cliente' ? 'selected' : ''}>Cliente</option>
                            <option value="master" ${u.role === 'master' ? 'selected' : ''}>Master</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label" style="color:var(--gray-400);">Empresa</label>
                        <select id="eu-empresaId" class="form-input" style="background:var(--gray-900); color:white;">
                            ${empresas.map(emp => `
                                <option value="${emp.id}" ${u.empresaId === emp.id ? 'selected' : ''}>${emp.nome}</option>
                            `).join('')}
                        </select>
                    </div>
                </div>
            </div>
        `;
        const footer = `
            <button class="btn btn-secondary" onclick="closeModal('modal-edit-user')">Cancelar</button>
            <button class="btn btn-primary" onclick="MasterPanel.confirmarEditarUsuario('${id}')">Salvar Acesso</button>
        `;
        showModal('modal-edit-user', 'Editar Acesso do Usuário', body, footer);
    },

    confirmarEditarUsuario(id) {
        const data = {
            nome: document.getElementById('eu-nome').value.trim(),
            email: document.getElementById('eu-email').value.trim(),
            senha: document.getElementById('eu-senha').value.trim(),
            role: document.getElementById('eu-role').value,
            empresaId: document.getElementById('eu-empresaId').value
        };

        if (Store.editarUsuario(id, data)) {
            closeModal('modal-edit-user');
            showToast('Acesso atualizado!', 'success');
            this.render();
        }
    },

    confirmarRemoverUsuario(id, nome) {
        const body = Security.html`
            <div style="text-align:center; padding:var(--space-4);">
                <div style="font-size:48px; margin-bottom:var(--space-4);">⚠️</div>
                <h3 style="color:white; margin-bottom:var(--space-2);">Excluir Operador?</h3>
                <p style="color:var(--gray-400); font-size:14px; line-height:1.6;">
                    Você está prestes a remover o acesso de <b>${nome}</b> permanentemente. Esta ação não pode ser desfeita.
                </p>
            </div>
        `;
        const footer = `
            <button class="btn btn-secondary" onclick="closeModal('modal-confirm-del')">Cancelar</button>
            <button class="btn btn-danger" onclick="MasterPanel.removerUsuario('${id}')">Confirmar Exclusão</button>
        `;
        showModal('modal-confirm-del', 'Segurança Master', body, footer);
    },

    removerUsuario(id) {
        const success = Store.excluirUsuario(id);
        if (success) {
            closeModal('modal-confirm-del');
            showToast('Usuário removido com sucesso!', 'success');
            this.render();
        } else {
            showToast('Erro ao remover usuário (Auto-proteção)', 'warning');
        }
    },

    // ====================================
    // NOVAS FUNCIONALIDADES MASTER (v3.5)
    // ====================================

    _renderComunicacao() {
        const config = Store.getState().saasConfig;
        return `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:32px;">
                <h2 style="color:white; font-size:24px; font-weight:800;">Sistema de Broadcast</h2>
                <div style="font-size:12px; color:var(--gray-500);">Envie avisos para todos os usuários logados.</div>
            </div>

            <div class="card" style="background:var(--gray-900); padding:32px; border:1px solid var(--gray-800); max-width:800px;">
                <div class="form-group">
                    <label class="form-label" style="color:var(--gray-400);">Mensagem do Aviso</label>
                    <textarea id="broadcast-msg" class="form-input" rows="4" style="background:var(--gray-950); border-color:var(--gray-800); color:white;" placeholder="Ex: Manutenção programada para hoje às 22h...">${config.broadcast.mensagem}</textarea>
                </div>

                <div style="display:flex; gap:16px; align-items:center; margin-top:24px;">
                    <button class="btn btn-primary" onclick="MasterPanel.salvarBroadcast()">
                        ${Icons.send || '🚀'} Publicar Aviso Global
                    </button>
                    ${config.broadcast.ativa ? `
                        <button class="btn btn-danger btn-outline" onclick="MasterPanel.desativarBroadcast()">
                            Remover Aviso Ativo
                        </button>
                    ` : ''}
                </div>

                <div style="margin-top:32px; padding:20px; border-radius:12px; background:rgba(255,255,255,0.02); border:1px dashed var(--gray-700);">
                    <h4 style="color:var(--gray-500); font-size:11px; text-transform:uppercase; margin-bottom:12px;">Pré-visualização do Banner</h4>
                    <div style="background:var(--primary); color:white; padding:12px 20px; border-radius:8px; display:flex; align-items:center; gap:12px; font-weight:600; font-size:14px;">
                        <span>📢</span>
                        <span id="broadcast-preview">${config.broadcast.mensagem || 'Sua mensagem aparecerá aqui...'}</span>
                    </div>
                </div>
            </div>
        `;
    },

    _renderFaturamento() {
        const empresas = Store.getEmpresas();
        const totalMRR = empresas.reduce((acc, emp) => {
            if (emp.plano === 'enterprise') return acc + 1990;
            if (emp.plano === 'premium') return acc + 490;
            return acc + 190;
        }, 0);

        return `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:32px;">
                <h2 style="color:white; font-size:24px; font-weight:800;">Saúde Financeira SaaS</h2>
                <div style="font-size:12px; color:var(--gray-500);">Estimativa baseada em planos ativos.</div>
            </div>

            <div style="display:grid; grid-template-columns: 1fr 2fr; gap:32px;">
                <div style="display:flex; flex-direction:column; gap:20px;">
                    <div class="card" style="background:linear-gradient(135deg, #1e1e2e, #11111b); padding:24px; border:1px solid var(--gray-800);">
                        <div style="color:var(--gray-500); font-size:11px; text-transform:uppercase;">MRR TOTAL ESTIMADO</div>
                        <div style="color:var(--success); font-size:36px; font-weight:900; margin-top:8px;">R$ ${totalMRR.toLocaleString()}</div>
                        <div style="color:var(--gray-600); font-size:12px; margin-top:4px;">+12.4% vs mês anterior</div>
                    </div>
                    
                    <div class="card" style="background:var(--gray-900); padding:24px; border:1px solid var(--gray-800);">
                        <h4 style="color:white; margin-bottom:16px; font-size:14px;">Distribuição de Planos</h4>
                        <div style="display:flex; flex-direction:column; gap:12px;">
                            ${['enterprise', 'premium', 'basic'].map(p => {
                                const count = empresas.filter(e => e.plano === p).length;
                                const perc = (count / empresas.length) * 100;
                                return `
                                    <div>
                                        <div style="display:flex; justify-content:space-between; font-size:12px; margin-bottom:4px;">
                                            <span style="color:var(--gray-400); text-transform:capitalize;">${p}</span>
                                            <span style="color:white;">${count} empresas</span>
                                        </div>
                                        <div style="height:6px; background:var(--gray-950); border-radius:3px;">
                                            <div style="height:100%; width:${perc}%; background:var(--primary); border-radius:3px;"></div>
                                        </div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>
                </div>

                <div class="card" style="background:var(--gray-900); padding:24px; border:1px solid var(--gray-800);">
                    <h4 style="color:white; margin-bottom:20px;">Últimas Faturas Geradas</h4>
                    <table style="width:100%; color:var(--gray-400); font-size:13px;">
                        <tr style="text-align:left; color:var(--gray-600); font-size:11px; text-transform:uppercase;">
                            <th style="padding-bottom:12px;">Empresa</th>
                            <th style="padding-bottom:12px;">Plano</th>
                            <th style="padding-bottom:12px;">Valor</th>
                            <th style="padding-bottom:12px;">Status</th>
                        </tr>
                        ${empresas.slice(0, 8).map(emp => `
                            <tr style="border-top:1px solid var(--gray-800);">
                                <td style="padding:12px 0; color:white; font-weight:600;">${emp.nome}</td>
                                <td style="padding:12px 0;">${emp.plano}</td>
                                <td style="padding:12px 0;">R$ ${emp.plano === 'enterprise' ? '1.990' : (emp.plano === 'premium' ? '490' : '190')}</td>
                                <td style="padding:12px 0;"><span style="color:var(--success);">Pago</span></td>
                            </tr>
                        `).join('')}
                    </table>
                </div>
            </div>
        `;
    },

    _renderSistema() {
        const config = Store.getState().saasConfig;
        return `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:32px;">
                <h2 style="color:white; font-size:24px; font-weight:800;">Saúde do Sistema & IA</h2>
                <div style="font-size:12px; color:var(--gray-500);">Configurações críticas do ecossistema.</div>
            </div>

            <div style="display:grid; grid-template-columns: repeat(2, 1fr); gap:24px;">
                <!-- IA Orchestrator -->
                <div class="card" style="background:var(--gray-900); padding:24px; border:1px solid var(--gray-800);">
                    <h3 style="color:white; font-size:18px; margin-bottom:20px; display:flex; align-items:center; gap:8px;">
                        ${Icons.sparkles || '✨'} Orquestrador de IA
                    </h3>
                    
                    <div class="form-group">
                        <label class="form-label" style="color:var(--gray-400);">Modelo de IA Padrão (Global)</label>
                        <select id="ia-model-select" class="form-input" style="background:var(--gray-950); border-color:var(--gray-800); color:white;" onchange="MasterPanel.updateIAConfig()">
                            <option value="gemini-1.5-pro" ${config.iaModel === 'gemini-1.5-pro' ? 'selected' : ''}>Gemini 1.5 Pro (Qualidade Máxima)</option>
                            <option value="gemini-1.5-flash" ${config.iaModel === 'gemini-1.5-flash' ? 'selected' : ''}>Gemini 1.5 Flash (Velocidade Relâmpago)</option>
                        </select>
                    </div>
                </div>

                <!-- Emergency lockdown & Reset -->
                <div class="card" style="background:var(--gray-900); padding:24px; border:1px solid var(--gray-800);">
                    <h3 style="color:white; font-size:18px; margin-bottom:20px; display:flex; align-items:center; gap:8px;">
                        ${Icons.shield || '🛡️'} Ferramentas de Desenvolvedor
                    </h3>

                    <div style="padding:16px; background:rgba(239, 68, 68, 0.05); border-radius:8px; border:1px dashed var(--danger); margin-bottom:20px;">
                        <h4 style="color:var(--danger); font-size:12px; font-weight:800; margin-bottom:8px;">☢️ ZONA DE PERIGO</h4>
                        <p style="font-size:11px; color:var(--gray-500); margin-bottom:12px;">Apaga permanentemente todos os dados locais e reinicia o sistema com os usuários padrão.</p>
                        <button class="btn btn-danger" style="width:100%; justify-content:center; border-style:dashed;" onclick="Store.systemHardReset()">
                            REDEFINIÇÃO DE FÁBRICA (RESET TOTAL)
                        </button>
                    </div>
                    
                    <div style="padding:16px; background:var(--gray-950); border-radius:8px; border:1px solid var(--gray-800); margin-bottom:20px;">
                        <h4 style="color:var(--warning); font-size:12px; font-weight:800; margin-bottom:8px;">🔒 LOCKDOWN DE EMERGÊNCIA</h4>
                        <button class="btn ${config.systemStatus === 'lockdown' ? 'btn-success' : 'btn-outline'}" style="width:100%; justify-content:center;" onclick="MasterPanel.toggleLockdown()">
                            ${config.systemStatus === 'lockdown' ? 'Desativar Lockdown' : 'Ativar Lockdown Agora'}
                        </button>
                    </div>

                    <div style="display:flex; gap:var(--space-2);">
                        <button class="btn btn-secondary" style="flex:1; justify-content:center; padding:12px;" onclick="MasterPanel.exportarDadosBackup()">
                            ${Icons.download || '📥'} Exportar Backup JSON
                        </button>
                        <button class="btn btn-outline" style="flex:1; justify-content:center; padding:12px;" onclick="document.getElementById('import-backup-file').click()">
                            ${Icons.upload || '📤'} Restaurar Backup
                        </button>
                        <input type="file" id="import-backup-file" style="display:none;" accept=".json" onchange="MasterPanel.importarDadosBackup(event)">
                    </div>
                </div>

                <!-- Configuração de Chave API Master -->
                <div class="card" style="grid-column: 1 / -1; background:var(--gray-900); padding:24px; border:1px solid var(--gray-800);">
                    <h3 style="color:white; font-size:18px; margin-bottom:20px; display:flex; align-items:center; gap:8px;">
                        ${Icons.settings || '⚙️'} Chave API Gemini Master
                    </h3>
                    <div class="form-group" style="max-width:500px;">
                        <label class="form-label" style="color:var(--gray-400);">Inserir chave (Salva apenas localmente neste dispositivo)</label>
                        <div style="display:flex; gap:8px;">
                            <input type="password" id="master-gemini-key" class="form-input" style="background:var(--gray-950); border-color:var(--gray-800); color:white;" value="${Store.getGeminiKey()}" placeholder="AIzaSy...">
                            <button class="btn btn-primary" onclick="MasterPanel.salvarConfigIA()">Salvar</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    // Ações das novas funcionalidades
    salvarBroadcast() {
        const msg = document.getElementById('broadcast-msg').value.trim();
        if (!msg) return showToast('Digite uma mensagem.', 'warning');
        
        const state = Store.getState();
        state.saasConfig.broadcast = {
            mensagem: msg,
            ativa: true,
            data: new Date().toISOString()
        };
        Store._notify();
        showToast('Aviso Global publicado com sucesso!', 'success');
        this.render();
    },

    desativarBroadcast() {
        const state = Store.getState();
        state.saasConfig.broadcast.ativa = false;
        Store._notify();
        showToast('Aviso Global removido.', 'info');
        this.render();
    },

    updateIAConfig() {
        const model = document.getElementById('ia-model-select').value;
        const state = Store.getState();
        state.saasConfig.iaModel = model;
        Store._notify();
        showToast(`Modelo Alterado: ${model}`, 'success');
    },

    toggleLockdown() {
        const state = Store.getState();
        const current = state.saasConfig.systemStatus;
        const novo = current === 'lockdown' ? 'normal' : 'lockdown';
        
        if (confirm(`Tem certeza que deseja colocar o sistema em modo ${novo.toUpperCase()}?`)) {
            state.saasConfig.systemStatus = novo;
            Store._notify();
            showToast(`Sistema em modo ${novo.toUpperCase()}`, novo === 'lockdown' ? 'danger' : 'success');
            this.render();
        }
    },

    salvarConfigIA() {
        const key = document.getElementById('master-gemini-key').value.trim();
        Store.setGeminiKey(key);
        showToast('Configuração IA Master Salva!', 'success');
    },

    exportarDadosBackup() {
        const data = Store.getState();
        const backup = {
            timestamp: new Date().toISOString(),
            users: data.users,
            contas: data.contas,
            cronogramas: data.cronogramas,
            notificacoes: data.notificacoes
        };
        
        const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `socialflow_backup_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showToast('Backup Json Master Baixado.', 'success');
    },

    importarDadosBackup(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const data = JSON.parse(e.target.result);
                if (!data.users || !data.contas) throw new Error("Formato inválido.");
                
                if (confirm('Atenção: Restaurar o backup substituirá TODOS os usuários e clientes deste dispositivo/domínio. Tem certeza?')) {
                    
                    // Sobrescrevemos o localStorage direto, porque o reload vai hidratar a Store.
                    const payload = {
                        users: data.users,
                        contas: data.contas,
                        empresas: data.empresas || [],
                        cronogramas: data.cronogramas || [],
                        notificacoes: data.notificacoes || [],
                        saasConfig: data.saasConfig || {}
                    };
                    localStorage.setItem('socialflow_data', JSON.stringify(payload));
                    
                    showToast('Backup restaurado! Recarregando sistema...', 'success');
                    setTimeout(() => location.reload(), 1500);
                }
            } catch (err) {
                showToast('Erro ao ler o arquivo de backup. Verifique se é o JSON correto.', 'danger');
            }
        };
        reader.readAsText(file);
        // Reset do input
        event.target.value = '';
    },

    // ====================================
    // TELEMETRIA & FEEDBACK (v4.0)
    // ====================================
    
    _renderSaude() {
        const errors = Store.getState().errorLogs || [];
        return `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:32px;">
                <h2 style="color:white; font-size:24px; font-weight:800;">Monitor de Saúde Técnica</h2>
                <div style="font-size:12px; color:var(--gray-500);">Últimos 100 erros detectados no ecossistema.</div>
            </div>

            <div class="card" style="background:var(--gray-900); border:1px solid var(--gray-800); overflow:hidden;">
                ${errors.length > 0 ? `
                    <table style="width:100%; border-collapse:collapse; color:var(--gray-300); font-size:12px;">
                        <thead>
                            <tr style="background:var(--gray-800); text-align:left; color:white;">
                                <th style="padding:16px;">Data/Hora</th>
                                <th style="padding:16px;">Usuário</th>
                                <th style="padding:16px;">Mensagem de Erro</th>
                                <th style="padding:16px;">Local (URL)</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${errors.map(err => Security.html`
                                <tr style="border-bottom:1px solid var(--gray-800); font-family:monospace;">
                                    <td style="padding:12px 16px; color:var(--gray-500); white-space:nowrap;">${formatDateRelative(err.data)}</td>
                                    <td style="padding:12px 16px; color:var(--primary);">${err.user || 'Visitante/Sistema'}</td>
                                    <td style="padding:12px 16px;"><span style="color:var(--danger); font-weight:700;">${err.message || 'Erro Desconhecido'}</span></td>
                                    <td style="padding:12px 16px; color:var(--gray-600); max-width:200px; overflow:hidden; text-overflow:ellipsis;">${err.url || '—'}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                ` : `
                    <div style="padding:48px; text-align:center; color:var(--gray-500);">
                        <div style="font-size:48px; margin-bottom:16px;">✨</div>
                        <p>Nenhum erro técnico detectado recentemente. Sistema 100% estável.</p>
                    </div>
                `}
            </div>
        `;
    },

    _renderFeedback() {
        const feedback = Store.getGlobalFeedback();
        return `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:32px;">
                <h2 style="color:white; font-size:24px; font-weight:800;">Mural de Feedback Global</h2>
                <div style="font-size:12px; color:var(--gray-500);">Agregação de todos os comentários dos clientes nas aprovações.</div>
            </div>

            <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap:20px;">
                ${feedback.length > 0 ? feedback.map(f => Security.html`
                    <div class="card" style="background:var(--gray-900); padding:20px; border:1px solid var(--gray-800);">
                        <div style="display:flex; justify-content:space-between; margin-bottom:12px;">
                            <span style="font-size:10px; font-weight:800; color:var(--primary); text-transform:uppercase;">${f.contaNome}</span>
                            <span style="font-size:10px; color:var(--gray-600);">${formatDateRelative(f.data)}</span>
                        </div>
                        <p style="color:white; font-size:14px; line-height:1.6; margin-bottom:12px;">"${f.detalhes}"</p>
                        <div style="border-top:1px solid var(--gray-800); padding-top:12px; font-size:11px; color:var(--gray-500);">
                            Evento: <b>${f.acao}</b> em <i>${f.cronogramaTitulo}</i>
                        </div>
                    </div>
                `).join('') : `
                    <div style="grid-column:1/-1; padding:48px; text-align:center; color:var(--gray-500);">
                        <p>Ainda não há feedbacks ou comentários processados.</p>
                    </div>
                `}
            </div>
        `;
    },

    _renderIAUsage() {
        const usage = Store.getState().iaUsage || {};
        const empresas = Store.getEmpresas();

        return `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:32px;">
                <h2 style="color:white; font-size:24px; font-weight:800;">Gestor de Tokens IA</h2>
                <div style="font-size:12px; color:var(--gray-500);">Monitoramento de custos e consumo por agência.</div>
            </div>

            <div class="card" style="background:var(--gray-900); padding:24px; border:1px solid var(--gray-800);">
                <table style="width:100%; border-collapse:collapse; color:white; font-size:14px;">
                    <thead>
                        <tr style="background:var(--gray-800); text-align:left;">
                            <th style="padding:16px;">Agência</th>
                            <th style="padding:16px;">Consumo de Tokens</th>
                            <th style="padding:16px;">Chamadas</th>
                            <th style="padding:16px;">Última Atividade</th>
                            <th style="padding:16px; text-align:right;">Estimativa de Custo</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${empresas.map(emp => {
                            const data = usage[emp.id] || { tokens: 0, totalChamadas: 0, ultimaAtividade: '—' };
                            const costEst = (data.tokens / 1000 * 0.01).toFixed(4); // Ex: $0.01 por 1k tokens
                            return `
                                <tr style="border-bottom:1px solid var(--gray-800);">
                                    <td style="padding:16px; font-weight:700;">${emp.nome}</td>
                                    <td style="padding:16px;">
                                        <div style="font-size:16px; font-weight:800;">${data.tokens.toLocaleString()} t</div>
                                        <div style="font-size:10px; color:var(--gray-500);">Tokens consumidos</div>
                                    </td>
                                    <td style="padding:16px;">${data.totalChamadas}</td>
                                    <td style="padding:16px; color:var(--gray-500); font-size:12px;">${data.ultimaAtividade !== '—' ? formatDateRelative(data.ultimaAtividade) : '—'}</td>
                                    <td style="padding:16px; text-align:right;">
                                        <span class="badge badge-success">$ ${costEst}</span>
                                    </td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }
};

document.addEventListener('DOMContentLoaded', () => MasterPanel.init());
