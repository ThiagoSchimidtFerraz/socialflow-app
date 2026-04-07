// ====================================
// SOCIALFLOW — Sidebar
// ====================================

function renderSidebar(activePage) {
    if (window.PORTAL_CLIENTE) return '';
    const user = Store.getState().currentUser;
    if (!user) return '';

    let menuItems = [];

    if (user.role === 'designer') {
        menuItems = [
            { id: 'dashboard', label: 'Central Criativa', icon: Icons.palette },
            { id: 'historico', label: 'Artes Finalizadas', icon: Icons.check },
        ];
    } else if (user.role === 'cliente') {
        menuItems = [
            { id: 'dashboard', label: 'Minhas Aprovações', icon: Icons.checkCircle },
            { id: 'calendario', label: 'Calendário Mensal', icon: Icons.grid },
        ];
    } else if (user.role === 'social_media') {
        menuItems = [
            { id: 'dashboard', label: 'Operação de Conteúdo', icon: Icons.edit },
            { id: 'cronogramas', label: 'Todos os Cronogramas', icon: Icons.calendar },
            { id: 'admin', label: 'Contas de Clientes', icon: Icons.users },
            { id: 'historico', label: 'Arquivo Geral', icon: Icons.archive },
        ];
    } else if (user.role === 'admin') {
        menuItems = [
            { id: 'lideranca', label: 'Visão Master', icon: Icons.barChart },
            { id: 'dashboard', label: 'Visão Operacional', icon: Icons.home },
            { id: 'aprovacoes', label: 'Monitor de Aprovações', icon: Icons.checkCircle },
            { id: 'historico', label: 'Histórico Completo', icon: Icons.archive },
            { id: 'admin', label: 'Gestão de Equipe', icon: Icons.users },
        ];
    } else if (user.role === 'master') {
        menuItems = [
            { id: 'lideranca', label: 'Visão Liderança', icon: Icons.barChart },
            { id: 'dashboard', label: 'Painel Geral', icon: Icons.home },
            { id: 'cronogramas', label: 'Conteúdos Master', icon: Icons.calendar },
            { id: 'calendario', label: 'Mapa de Cronogramas', icon: Icons.grid },
            { id: 'aprovacoes', label: 'Aprovações Globais', icon: Icons.checkCircle },
            { id: 'admin', label: 'Gestão da Agência', icon: Icons.users },
        ];
    }

    const pendentes = Store.getCronogramas().filter(c => c.status && c.status.startsWith('aguardando_aprovacao')).length;
    const pendentesAdmin = (user.role === 'admin' || user.role === 'master') ? Store.getUsuariosPendentes().length : 0;


    // Contas do usuário
    const contasDoUsuario = Store.getContasDoUsuario();
    const contaAtiva = Store.getContaAtiva();

    return `
        <aside class="sidebar" id="sidebar">
            <div class="sidebar-logo">
                <img src="assets/logo.png" alt="SocialFlow" class="app-logo-sidebar">
                <div class="sidebar-logo-text">SocialFlow</div>
                
                <!-- Status da Nuvem -->
                <div id="cloud-status-container" class="cloud-status ${SupabaseSync.isOnline() ? 'online' : 'offline'}">
                    <div class="dot"></div>
                    <span>${SupabaseSync.isOnline() ? 'Nuvem' : 'Local'}</span>
                </div>
            </div>

            <!-- Seletor de Conta -->
            ${contasDoUsuario.length > 0 ? `
                <div class="conta-selector">
                    ${user.role === 'cliente' ? `
                        <!-- Cliente: mostra apenas sua conta -->
                        <div class="conta-selector-current" style="cursor:default;">
                            <div class="conta-selector-icon" style="background:${contaAtiva?.cor || 'var(--primary)'};">
                                ${contaAtiva?.nome?.charAt(0) || '?'}
                            </div>
                            <div class="conta-selector-info">
                                <div class="conta-selector-name">${contaAtiva?.nome || 'Sem conta'}</div>
                                <div class="conta-selector-label">Sua conta</div>
                            </div>
                        </div>
                    ` : `
                        <!-- Social Media / Designer / Admin: pode alternar -->
                        <div class="conta-selector-current" onclick="toggleContaDropdown()">
                            <div class="conta-selector-icon" style="background:${contaAtiva?.cor || 'var(--gray-400)'};">
                                ${contaAtiva?.nome?.charAt(0) || '?'}
                            </div>
                            <div class="conta-selector-info">
                                <div class="conta-selector-name">${contaAtiva?.nome || 'Selecione uma conta'}</div>
                                <div class="conta-selector-label">Conta ativa</div>
                            </div>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color:var(--gray-400); flex-shrink:0;"><path d="m6 9 6 6 6-6"/></svg>
                        </div>
                        <div class="conta-dropdown" id="conta-dropdown" style="display:none;">
                            ${contasDoUsuario.map(conta => `
                                <button class="conta-dropdown-item ${conta.id === contaAtiva?.id ? 'active' : ''}" 
                                    onclick="selecionarConta('${conta.id}')">
                                    <div class="conta-selector-icon" style="background:${conta.cor}; width:28px; height:28px; font-size:var(--font-xs);">
                                        ${conta.nome.charAt(0)}
                                    </div>
                                    <span>${conta.nome}</span>
                                    ${conta.id === contaAtiva?.id ? Icons.check : ''}
                                </button>
                            `).join('')}
                        </div>
                    `}
                </div>
            ` : ''}

            <nav class="sidebar-nav">
                <div style="font-size:11px; font-weight:800; color:var(--gray-400); text-transform:uppercase; letter-spacing:0.05em; padding:16px 16px 8px;">Navegação</div>
                ${menuItems.map(item => `
                    <button class="sidebar-item ${activePage === item.id ? 'active' : ''}" onclick="window.acessarSidebarItem('${item.id}')">
                        ${item.icon}
                        <span>${item.label}</span>
                        ${item.id === 'aprovacoes' && pendentes > 0 ? `<span class="badge badge-aguardando" style="margin-left:auto;font-size:11px;">${pendentes}</span>` : ''}
                        ${item.id === 'admin' && pendentesAdmin > 0 ? `<span class="badge badge-aguardando" style="margin-left:auto;font-size:11px;">${pendentesAdmin}</span>` : ''}
                    </button>
                `).join('')}

                <div class="sidebar-section-title" style="margin-top: var(--space-4);">Atalhos</div>
                ${user.role === 'social_media' || user.role === 'master' ? `
                    <button class="sidebar-item" onclick="abrirModalNovoCronograma()">
                        ${Icons.plus}
                        <span>Novo Cronograma</span>
                    </button>
                ` : ''}
            </nav>

            ${user.role === 'social_media' || user.role === 'designer' || user.role === 'master' ? `
                <div style="padding:var(--space-4) var(--space-4); border:none; background:transparent; margin-top:auto;">
                    <div style="font-size:10px; color:var(--gray-500); text-transform:uppercase; font-weight:700; margin-bottom:6px; letter-spacing:0.5px;">Cliente Ativo</div>
                    ${contaAtiva ? `
                        <div style="display:flex; align-items:center; gap:8px;" onclick="toggleContaDropdown()" style="cursor:pointer;">
                            <div style="width:10px; height:10px; border-radius:50%; background:${contaAtiva.cor}; box-shadow:0 0 4px ${contaAtiva.cor}80;"></div>
                            <span style="font-size:13px; font-weight:600; color:var(--gray-800); text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">${contaAtiva.nome}</span>
                        </div>
                    ` : `
                        <div style="display:flex; align-items:center; gap:8px;">
                            <div style="width:10px; height:10px; border-radius:50%; background:var(--gray-300);"></div>
                            <span style="font-size:13px; font-weight:600; color:var(--gray-400);">SEM CLIENTES</span>
                        </div>
                    `}
                </div>
            ` : ''}

            <div class="sidebar-footer" style="border:none; margin-top:auto;">
                <div class="sidebar-user" onclick="abrirModalPerfil()" style="cursor:pointer;" title="Meu Perfil">
                    ${renderAvatar(user)}
                    <div class="sidebar-user-info">
                        <div class="sidebar-user-name">${user.nome}</div>
                        <div class="sidebar-user-role">${ROLE_LABELS[user.role]}</div>
                    </div>
                </div>
                <button class="btn-logout" onclick="Store.logout()" title="Sair da conta">
                    ${Icons.logOut}
                    <span>Sair</span>
                </button>
            </div>
        </aside>
    `;
}

window.acessarSidebarItem = function(id) {
    Store.navigate(id);
};

function toggleUserMenu() {
    const menu = document.getElementById('user-menu');
    if (menu) {
        menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
    }
}

function toggleContaDropdown() {
    const dropdown = document.getElementById('conta-dropdown');
    if (dropdown) {
        dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
    }
}

function selecionarConta(contaId) {
    Store.trocarConta(contaId);
    const dropdown = document.getElementById('conta-dropdown');
    if (dropdown) dropdown.style.display = 'none';
    Store.navigate('dashboard');
}
