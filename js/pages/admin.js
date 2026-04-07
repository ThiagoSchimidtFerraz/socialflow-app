// ====================================
// SOCIALFLOW — Painel Admin
// ====================================

let adminTab = 'pendentes';

function renderAdminPage() {
    const user = Store.getState().currentUser;
    if (!user || (user.role !== 'admin' && user.role !== 'master' && user.role !== 'social_media')) {
        Store.navigate('dashboard');
        return '';
    }

    // Se for Social Media e estiver numa aba proibida, forçar 'contas'
    if (user.role === 'social_media' && adminTab !== 'contas') {
        adminTab = 'contas';
    }

    const pendentesRaw = Store.getUsuariosPendentes();
    const todosUsuariosRaw = Store.getTodosUsuarios();
    
    // FILTRO DE GOVERNANÇA (Thiago): Administradores não veem Master
    const pendentes = user.role === 'master' ? pendentesRaw : pendentesRaw.filter(u => u.role !== 'master');
    const todosUsuarios = user.role === 'master' ? todosUsuariosRaw : todosUsuariosRaw.filter(u => u.role !== 'master');
    
    const contas = Store.getContas();

    return `
        ${renderSidebar('admin')}
        <main class="main-content">
            <div class="page-header">
                <div>
                    <h1>${(user.role === 'admin' || user.role === 'master') ? 'Painel Administrativo' : 'Gestão de Configurações'}</h1>
                    <p class="page-header-subtitle">${(user.role === 'admin' || user.role === 'master') ? 'Gerencie usuários, aprovações e contas de clientes' : 'Gerencie as contas ativas do fluxo'}</p>
                </div>
                <div style="display:flex; gap:var(--space-3); align-items:center;">
                    ${(user.role === 'admin' || user.role === 'master') && pendentes.length > 0 ? `
                        <span class="badge badge-aguardando" style="font-size:var(--font-sm); padding:6px 16px;">
                            ${pendentes.length} pendente(s)
                        </span>
                    ` : ''}
                    <button class="btn btn-primary" onclick="abrirModalNovaConta()">
                        ${Icons.plus} Nova Conta
                    </button>
                </div>
            </div>

            <div class="page-body">
                <!-- Tabs -->
                <div class="tabs animate-fade-in" style="margin-bottom:var(--space-6);">
                    ${(user.role === 'admin' || user.role === 'master') ? `
                        <button class="tab ${adminTab === 'pendentes' ? 'active' : ''}" onclick="mudarAdminTab('pendentes')">
                            ${Icons.clock} Aprovações Pendentes (${pendentes.length})
                        </button>
                        <button class="tab ${adminTab === 'usuarios' ? 'active' : ''}" onclick="mudarAdminTab('usuarios')">
                            ${Icons.users} Todos os Usuários (${todosUsuarios.length})
                        </button>
                    ` : ''}
                    <button class="tab ${adminTab === 'contas' ? 'active' : ''}" onclick="mudarAdminTab('contas')">
                        ${Icons.home} Contas de Clientes (${contas.length})
                    </button>
                </div>

                <div class="animate-fade-in" style="animation-delay:0.1s;">
                    ${adminTab === 'pendentes' && (user.role === 'admin' || user.role === 'master') ? renderAdminPendentes(pendentes) : ''}
                    ${adminTab === 'usuarios' && (user.role === 'admin' || user.role === 'master') ? renderAdminUsuarios(todosUsuarios) : ''}
                    ${adminTab === 'contas' ? renderAdminContas(contas) : ''}
                </div>
            </div>
        </main>
    `;
}

function renderAdminPendentes(pendentes) {
    if (pendentes.length === 0) {
        return `
            <div class="card empty-state">
                ${Icons.checkCircle}
                <h3>Nenhum cadastro pendente</h3>
                <p>Todos os cadastros foram processados!</p>
            </div>
        `;
    }

    return pendentes.map((u, i) => `
        <div class="card" style="padding:var(--space-5); margin-bottom:var(--space-3); animation: fadeInUp 0.3s ease ${i * 0.05}s both;">
            <div style="display:flex; align-items:center; gap:var(--space-4);">
                ${renderAvatar(u, 'lg')}
                <div style="flex:1;">
                    <div style="font-weight:700; color:var(--gray-900); font-size:var(--font-base);">${u.nome}</div>
                    <div style="font-size:var(--font-sm); color:var(--gray-500); margin-top:2px;">${u.email}</div>
                    <div style="display:flex; gap:var(--space-3); margin-top:var(--space-2); font-size:var(--font-xs); color:var(--gray-400);">
                        <span class="badge ${u.role === 'social_media' ? 'badge-em-producao' : u.role === 'designer' ? 'badge-revisao' : 'badge-aprovado'}" style="font-size:10px;">
                            ${ROLE_LABELS[u.role]}
                        </span>
                        <span>${Icons.clock} Solicitado em ${formatDateTime(u.criadoEm)}</span>
                    </div>
                </div>
                <div style="display:flex; gap:var(--space-2);">
                    <button class="btn btn-success btn-sm" onclick="adminAprovarUsuario('${u.id}')">
                        ${Icons.check} Aprovar
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="adminRejeitarUsuario('${u.id}')">
                        ${Icons.x} Rejeitar
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

function renderAdminUsuarios(usuarios) {
    if (usuarios.length === 0) {
        return `
            <div class="card empty-state">
                ${Icons.users}
                <h3>Nenhum usuário cadastrado</h3>
                <p>Aguardando cadastros de novos usuários.</p>
            </div>
        `;
    }

    return `
        <div class="card" style="overflow:hidden;">
            <table class="admin-table">
                <thead>
                    <tr>
                        <th>Usuário</th>
                        <th>E-mail</th>
                        <th>Tipo</th>
                        <th>Status</th>
                        <th>Contas</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody>
                    ${usuarios.map(u => {
                        const contasNomes = u.contasIds.map(cid => {
                            const conta = Store.getContaById(cid);
                            return conta ? conta.nome : cid;
                        });
                        return `
                            <tr>
                                <td>
                                    <div style="display:flex; align-items:center; gap:var(--space-2);">
                                        ${renderAvatar(u, 'sm')}
                                        <span style="font-weight:600;">${u.nome}</span>
                                    </div>
                                </td>
                                <td style="color:var(--gray-500);">${u.email}</td>
                                <td>
                                    <span class="badge ${u.role === 'social_media' ? 'badge-em-producao' : u.role === 'designer' ? 'badge-revisao' : 'badge-aprovado'}" style="font-size:10px;">
                                        ${ROLE_LABELS[u.role]}
                                    </span>
                                </td>
                                <td>
                                    <span class="badge ${USER_STATUS_CLASSES[u.status]}" style="font-size:10px;">
                                        <span class="badge-dot"></span>${USER_STATUS_LABELS[u.status]}
                                    </span>
                                </td>
                                <td>
                                    ${contasNomes.length > 0
                                        ? contasNomes.map(n => `<span class="admin-conta-tag">${n}</span>`).join(' ')
                                        : '<span style="color:var(--gray-400); font-size:var(--font-xs);">Nenhuma</span>'
                                    }
                                </td>
                                <td>
                                    <div style="display:flex; gap:var(--space-1);">
                                        <button class="btn btn-ghost btn-sm" onclick="abrirModalVincularContas('${u.id}')" title="Gerenciar Contas">
                                            ${Icons.edit}
                                        </button>
                                        ${(Store.getState().currentUser.role === 'master' || (u.role !== 'admin' && u.role !== 'master')) ? `
                                            <button class="btn btn-ghost btn-sm text-danger" onclick="adminExcluirUsuario('${u.id}', '${u.nome}')" title="Excluir Usuário">
                                                ${Icons.trash || Icons.x}
                                            </button>
                                        ` : ''}
                                    </div>
                                </td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        </div>
    `;
}

function renderAdminContas(contas) {
    return `
        <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(300px, 1fr)); gap:var(--space-4);">
            ${contas.map((conta, i) => {
                const cronogramasCount = Store.getAllCronogramas().filter(c => c.contaId === conta.id).length;
                const usuariosCount = Store.getTodosUsuarios().filter(u => u.contasIds.includes(conta.id)).length;

                return `
                    <div class="card card-body" style="animation: fadeInUp 0.3s ease ${i * 0.05}s both;">
                        <div style="display:flex; align-items:center; gap:var(--space-3); margin-bottom:var(--space-4);">
                            <div style="width:44px; height:44px; border-radius:var(--radius-lg); background:${conta.cor}; display:flex; align-items:center; justify-content:center; color:white; font-weight:800; font-size:var(--font-lg);">
                                ${conta.nome.charAt(0)}
                            </div>
                            <div>
                                <div style="font-weight:700; color:var(--gray-900);">${conta.nome}</div>
                                <div style="font-size:var(--font-xs); color:var(--gray-400);">Criada em ${formatDate(conta.criadoEm)}</div>
                            </div>
                        </div>
                        ${conta.emailCliente ? `
                        <div style="background:var(--gray-50); border:1px solid var(--gray-100); border-radius:var(--radius-md); padding:8px 12px; margin-bottom:var(--space-4); display:flex; align-items:center; gap:var(--space-2);">
                            <span style="color:var(--gray-400);">${Icons.mail}</span>
                            <span style="font-size:12px; color:var(--gray-700); font-weight:500;">${conta.emailCliente}</span>
                        </div>
                        ` : ''}
                        <div style="display:flex; gap:var(--space-6); padding-top:var(--space-3); border-top:1px solid var(--gray-100);">
                            <div style="text-align:center;">
                                <div style="font-size:var(--font-2xl); font-weight:800; color:var(--gray-900);">${cronogramasCount}</div>
                                <div style="font-size:var(--font-xs); color:var(--gray-500);">Cronogramas</div>
                            </div>
                            <div style="text-align:center;">
                                <div style="font-size:var(--font-2xl); font-weight:800; color:var(--gray-900);">${usuariosCount}</div>
                                <div style="font-size:var(--font-xs); color:var(--gray-500);">Membros</div>
                            </div>
                            <div style="margin-left:auto; display:flex; align-items:center; gap:var(--space-2); align-items:flex-end;">
                                <button class="btn btn-ghost btn-sm" onclick="event.stopPropagation(); abrirModalEditarConta('${conta.id}')" title="Editar conta">
                                    ${Icons.edit} Editar
                                </button>
                                ${Store.getState().currentUser.role !== 'social_media' ? `
                                    <button class="btn btn-danger btn-sm" onclick="event.stopPropagation(); confirmarExcluirConta('${conta.id}', '${conta.nome}')" title="Excluir conta">
                                        ${Icons.trash || Icons.x} Excluir
                                    </button>
                                ` : ''}
                            </div>
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
    `;
}

// ---- Ações Admin ----

function mudarAdminTab(tab) {
    adminTab = tab;
    App.render();
}

function adminAprovarUsuario(userId) {
    Store.aprovarUsuario(userId);
    showToast('Usuário aprovado com sucesso! ✅', 'success');
}

function adminRejeitarUsuario(userId) {
    if (confirm('Tem certeza que deseja rejeitar este cadastro?')) {
        Store.rejeitarUsuario(userId);
        showToast('Cadastro rejeitado.', 'warning');
    }
}

function adminExcluirUsuario(userId, nome) {
    const user = Store.getState().currentUser;
    if (userId === user.id) {
        showToast('Você não pode se auto-excluir!', 'danger');
        return;
    }

    if (confirm(`⚠️ ATENÇÃO: Deseja remover permanentemente o acesso de "${nome}"?\n\nEsta ação não pode ser desfeita.`)) {
        Store.excluirUsuario(userId);
        showToast('Usuário removido com sucesso.', 'success');
        App.render();
    }
}

function abrirModalNovaConta() {
    const body = `
        <form id="form-nova-conta" onsubmit="criarNovaConta(event)">
            <div class="form-group" style="margin-bottom:var(--space-4);">
                <label class="form-label">Nome da Conta / Marca</label>
                <input type="text" class="form-input" id="conta-nome" placeholder="Ex: Loja Fashion, Restaurante XYZ..." required>
            </div>
            <div class="form-group" style="margin-bottom:var(--space-4);">
                <label class="form-label">E-mail Principal (Login do Cliente)</label>
                <input type="email" class="form-input" id="conta-email" placeholder="cliente@marca.com">
                <p style="font-size:10px; color:var(--gray-400); margin-top:4px;">Cria automaticamente um acesso com senha "123".</p>
            </div>
            <div class="form-group" style="margin-bottom:var(--space-4);">
                <label class="form-label">E-mails p/ Notificação (Opcional)</label>
                <input type="text" class="form-input" id="conta-emails-extras" placeholder="socio@marca.com, marketing@marca.com">
                <p style="font-size:10px; color:var(--gray-400); margin-top:4px;">Separe por vírgula. Usado para cópias de avisos de aprovação.</p>
            </div>
            <div class="form-group">
                <label class="form-label">Cor de identificação</label>
                <div style="display:flex; gap:var(--space-2); flex-wrap:wrap; margin-top:var(--space-2);">
                    ${['#4F46E5','#7C3AED','#EC4899','#EF4444','#F59E0B','#10B981','#3B82F6','#14B8A6','#D97706','#6366F1'].map(cor => `
                        <div class="color-picker-item" style="background:${cor};" onclick="selecionarCorConta(this, '${cor}')" data-cor="${cor}"></div>
                    `).join('')}
                </div>
                <input type="hidden" id="conta-cor" value="#4F46E5">
            </div>
        </form>
    `;
    const footer = `
        <button class="btn btn-secondary" onclick="closeModal('modal-nova-conta')">Cancelar</button>
        <button class="btn btn-primary" onclick="document.getElementById('form-nova-conta').requestSubmit()">
            ${Icons.plus} Criar Conta
        </button>
    `;
    showModal('modal-nova-conta', 'Nova Conta de Cliente', body, footer);

    // Selecionar primeira cor por padrão
    setTimeout(() => {
        const first = document.querySelector('.color-picker-item');
        if (first) first.classList.add('selected');
    }, 100);
}

function selecionarCorConta(el, cor) {
    document.querySelectorAll('.color-picker-item').forEach(i => i.classList.remove('selected'));
    el.classList.add('selected');
    document.getElementById('conta-cor').value = cor;
}

function criarNovaConta(e) {
    e.preventDefault();
    const nome = document.getElementById('conta-nome').value.trim();
    const cor = document.getElementById('conta-cor').value;
    const emailCliente = document.getElementById('conta-email').value.trim().toLowerCase();
    const emailsExtras = document.getElementById('conta-emails-extras').value.trim();
    
    if (!nome) {
        showToast('Digite o nome da conta', 'warning');
        return;
    }
    Store.criarConta({ nome, cor, emailCliente, emailsExtras });
    closeModal('modal-nova-conta');
    showToast('Conta criada com sucesso! 🎉', 'success');
}

function abrirModalVincularContas(userId) {
    const user = Store.getUserById(userId);
    if (!user) return;

    const todasContas = Store.getContas();

    const body = `
        <p style="font-size:var(--font-sm); color:var(--gray-500); margin-bottom:var(--space-4);">
            Selecione as contas que <strong>${user.nome}</strong> terá acesso:
        </p>
        <div style="display:flex; flex-direction:column; gap:var(--space-2);">
            ${todasContas.map(conta => {
                const isVinculado = user.contasIds.includes(conta.id);
                return `
                    <label class="conta-checkbox-item" style="display:flex; align-items:center; gap:var(--space-3); padding:var(--space-3); border:1.5px solid ${isVinculado ? 'var(--primary)' : 'var(--gray-200)'}; border-radius:var(--radius-md); cursor:pointer; transition:all 0.2s ease; background:${isVinculado ? 'var(--primary-50)' : 'var(--white)'};">
                        <input type="checkbox" class="conta-check" value="${conta.id}" ${isVinculado ? 'checked' : ''} 
                            onchange="toggleContaVinculo('${userId}', '${conta.id}', this.checked)"
                            style="width:18px; height:18px; accent-color:var(--primary);">
                        <div style="width:32px; height:32px; border-radius:var(--radius-md); background:${conta.cor}; display:flex; align-items:center; justify-content:center; color:white; font-weight:700; font-size:var(--font-sm);">
                            ${conta.nome.charAt(0)}
                        </div>
                        <span style="font-weight:600; color:var(--gray-800); font-size:var(--font-sm);">${conta.nome}</span>
                    </label>
                `;
            }).join('')}
        </div>
    `;
    const footer = `
        <button class="btn btn-primary" onclick="closeModal('modal-vincular-contas')">Concluir</button>
    `;
    showModal('modal-vincular-contas', 'Gerenciar Contas', body, footer);
}

function toggleContaVinculo(userId, contaId, checked) {
    if (checked) {
        Store.vincularUsuarioConta(userId, contaId);
    } else {
        Store.desvincularUsuarioConta(userId, contaId);
    }
    // Re-render o modal
    abrirModalVincularContas(userId);
}

function confirmarExcluirConta(contaId, contaNome) {
    if (confirm(`⚠️ Tem certeza que deseja EXCLUIR a conta "${contaNome}"?\n\nIsso irá remover:\n• Todos os cronogramas da conta\n• Todas as notificações vinculadas\n• Desvincular todos os usuários\n\nEsta ação NÃO pode ser desfeita!`)) {
        Store.excluirConta(contaId);
        showToast(`Conta "${contaNome}" excluída com sucesso! 🗑️`, 'warning');
    }
}

// ---- Edição de Conta ----

function abrirModalEditarConta(contaId) {
    const conta = Store.getContaById(contaId);
    if (!conta) return;

    const body = `
        <form id="form-editar-conta" onsubmit="confirmarEditarConta(event, '${contaId}')">
            <div class="form-group" style="margin-bottom:var(--space-4);">
                <label class="form-label">Nome da Conta / Marca</label>
                <input type="text" class="form-input" id="edit-conta-nome" value="${conta.nome}" required>
            </div>
            <div class="form-group" style="margin-bottom:var(--space-4);">
                <label class="form-label">E-mail Principal (Login)</label>
                <input type="email" class="form-input" id="edit-conta-email" value="${conta.emailCliente || ''}" placeholder="cliente@marca.com">
                <p style="font-size:10px; color:var(--gray-400); margin-top:4px;">Nota: Alterar este e-mail não altera o login se o usuário já existir.</p>
            </div>
            <div class="form-group" style="margin-bottom:var(--space-4);">
                <label class="form-label">E-mails p/ Notificação</label>
                <input type="text" class="form-input" id="edit-conta-emails-extras" value="${conta.emailsExtras || ''}" placeholder="socio@marca.com, marketing@marca.com">
            </div>
            <div class="form-group">
                <label class="form-label">Cor de identificação</label>
                <div style="display:flex; gap:var(--space-2); flex-wrap:wrap; margin-top:var(--space-2);">
                    ${['#4F46E5','#7C3AED','#EC4899','#EF4444','#F59E0B','#10B981','#3B82F6','#14B8A6','#D97706','#6366F1'].map(cor => `
                        <div class="color-picker-item ${conta.cor === cor ? 'selected' : ''}" style="background:${cor};" onclick="selecionarCorConta(this, '${cor}')" data-cor="${cor}"></div>
                    `).join('')}
                </div>
                <input type="hidden" id="edit-conta-cor" value="${conta.cor}">
            </div>
        </form>
    `;
    const footer = `
        <button class="btn btn-secondary" onclick="closeModal('modal-editar-conta')">Cancelar</button>
        <button class="btn btn-primary" onclick="document.getElementById('form-editar-conta').requestSubmit()">
            ${Icons.check} Salvar Alterações
        </button>
    `;
    showModal('modal-editar-conta', 'Editar Conta', body, footer);
}

function confirmarEditarConta(e, contaId) {
    e.preventDefault();
    const nome = document.getElementById('edit-conta-nome').value.trim();
    const emailCliente = document.getElementById('edit-conta-email').value.trim().toLowerCase();
    const emailsExtras = document.getElementById('edit-conta-emails-extras').value.trim();
    const cor = document.getElementById('edit-conta-cor').value;

    Store.editarConta(contaId, { nome, emailCliente, emailsExtras, cor });
    closeModal('modal-editar-conta');
    showToast('Conta atualizada com sucesso! ✨', 'success');
}
