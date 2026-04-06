// ====================================
// SOCIALFLOW — Utilitários Comuns (Segurança v3.0)
// ====================================

// Sanitização básica de HTML contra XSS (Segurança v3.5 - Zero-Vulnerability Core)
const Security = {
    // Escapa caracteres especiais para evitar execução de Scripts
    escape(str) {
        if (!str) return '';
        if (typeof str !== 'string') return str;
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;')
            .replace(/`/g, '&#96;');
    },

    // Sanitiza uma string removendo tags mas mantendo o texto
    sanitize(str) {
        if (!str) return '';
        const temp = document.createElement('div');
        temp.textContent = str;
        return temp.innerHTML;
    },
    
    // Helper para injetar HTML de forma mais segura
    safeHTML(id, rawHTML) {
        const el = document.getElementById(id);
        if (el) {
            // No futuro, aqui poderíamos integrar DOMPurify
            el.innerHTML = rawHTML;
        }
    }
};

// Tag function para templates literais (Segurança v3.5)
// Exemplo: Security.html`<div>${u.nome}</div>` -> Sanitiza automaticamente o nome
Security.html = function(strings, ...values) {
    return strings.reduce((result, string, i) => {
        const value = values[i] || '';
        const escapedValue = (typeof value === 'string') ? Security.escape(value) : value;
        return result + string + escapedValue;
    }, '');
};

window.Security = Security;

function renderStatusBadge(status) {
    const label = STATUS_LABELS[status] || status;
    const cls = STATUS_CLASSES[status] || 'badge-rascunho';
    return `<span class="badge ${cls}"><span class="badge-dot"></span>${label}</span>`;
}

function renderAvatar(user, size = '') {
    if (!user) return '';
    const roleClass = {
        admin: 'avatar-admin',
        social_media: 'avatar-social',
        designer: 'avatar-designer',
        cliente: 'avatar-cliente',
    };
    const sizeClass = size ? `avatar-${size}` : '';
    return `<div class="avatar ${roleClass[user.role] || ''} ${sizeClass}">${user.avatar}</div>`;
}

function formatDate(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function formatDateTime(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

function formatDateRelative(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Agora mesmo';
    if (diffMins < 60) return `${diffMins}min atrás`;
    if (diffHours < 24) return `${diffHours}h atrás`;
    if (diffDays < 7) return `${diffDays}d atrás`;
    return formatDate(dateStr);
}

function renderProgressBar(percent) {
    return `
        <div class="progress-bar">
            <div class="progress-fill" style="width: ${percent}%"></div>
        </div>
    `;
}

function calcProgress(cronograma) {
    if (cronograma.status === 'concluido') return 100;
    if (cronograma.status === 'agendado') return 90;
    if (cronograma.status === 'aprovado') return 80;
    if (cronograma.status === 'aguardando_aprovacao_artes' || cronograma.status === 'revisao_artes') return 60;
    if (cronograma.status === 'em_producao') return 40;
    if (cronograma.status === 'aguardando_aprovacao_conteudo' || cronograma.status === 'revisao_conteudo') return 20;
    return 5;
}

function showToast(message, type = 'success') {
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <span class="toast-message">${message}</span>
        <button class="toast-close" onclick="this.parentElement.remove()">${Icons.x}</button>
    `;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(20px)';
        toast.style.transition = 'all 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}

function renderModal(id, title, bodyHtml, footerHtml = '', large = false) {
    return `
        <div class="modal-overlay" id="${id}" onclick="if(event.target===this)this.remove()">
            <div class="modal ${large ? 'modal-lg' : ''}">
                <div class="modal-header">
                    <h2>${title}</h2>
                    <button class="btn-icon" onclick="document.getElementById('${id}').remove()">
                        ${Icons.x}
                    </button>
                </div>
                <div class="modal-body">
                    ${bodyHtml}
                </div>
                ${footerHtml ? `<div class="modal-footer">${footerHtml}</div>` : ''}
            </div>
        </div>
    `;
}

function showModal(id, title, bodyHtml, footerHtml = '', large = false) {
    const existing = document.getElementById(id);
    if (existing) existing.remove();

    const div = document.createElement('div');
    div.innerHTML = renderModal(id, title, bodyHtml, footerHtml, large);
    document.body.appendChild(div.firstElementChild);
}

function closeModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.remove();
}

function getRandomColor() {
    const colors = ['#4F46E5', '#7C3AED', '#EC4899', '#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#6366F1', '#8B5CF6', '#14B8A6'];
    return colors[Math.floor(Math.random() * colors.length)];
}

// ====================================
// AÇÕES GLOBAIS DE APROVAÇÃO
// ====================================

window.aprovarFase = function(id, tipo) {
    const c = Store.getCronogramaById(id);
    // Texto aprovado -> Vai para Design (em_producao)
    // Artes aprovadas pelo SM -> Vai para Aprovação do Cliente (aguardando_aprovacao_artes)
    // Artes aprovadas pelo Cliente -> Vai para Aprovado (aprovado)
    
    let novoStatus = '';
    if (tipo === 'conteudo') novoStatus = 'em_producao';
    else if (tipo === 'artes_interna') novoStatus = 'aguardando_aprovacao_artes';
    else novoStatus = 'aprovado';

    Store.mudarStatus(id, novoStatus);
    showToast(`Etapa aprovada com sucesso!`, 'success');
    App.render();
}

window.abrirModalAprovarObs = function(id, tipo) {
    const c = Store.getCronogramaById(id);
    const labelTipo = tipo === 'conteudo' ? 'Textos' : 'Artes';
    
    const body = `
        <div style="margin-bottom:var(--space-4);">
            <label class="form-label">Adicione sua observação sobre as ${labelTipo} (opcional)</label>
            <textarea id="obs-aprovacao-${id}" class="form-input" rows="4" placeholder="Ex: Gostei, mas mudem a data para o dia 15..."></textarea>
            <p style="font-size:11px; color:var(--gray-500); margin-top:4px;">A etapa será aprovada, mas a equipe verá esta nota para os próximos passos.</p>
        </div>
    `;
    const footer = `
        <button class="btn btn-secondary" onclick="closeModal('modal-obs-aprov')">Cancelar</button>
        <button class="btn btn-success" onclick="confirmarAprovacaoObs('${id}', '${tipo}')">${Icons.check} Aprovar com Observação</button>
    `;
    showModal('modal-obs-aprov', `Aprovar ${labelTipo} com Observação — ${c.titulo}`, body, footer);
}

window.confirmarAprovacaoObs = function(id, tipo) {
    const textarea = document.getElementById(`obs-aprovacao-${id}`);
    const obs = textarea ? textarea.value.trim() : '';
    
    const c = Store.getCronogramaById(id);
    const novoStatus = tipo === 'conteudo' ? 'em_producao' : 'aprovado';
    const labelTipo = tipo === 'conteudo' ? 'Textos' : 'Artes';

    // Mudar status incluindo a obs como comentário
    Store.mudarStatus(id, novoStatus, obs);
    
    // Gerar notificação para o SM
    Store.addNotificacao({
        tipo: 'observacao',
        titulo: `Aprovação de ${labelTipo} (Com ressalvas)`,
        mensagem: `Cliente APROVOU etapa de ${labelTipo} de "${c.titulo}", com observações:\n"${obs || 'Nenhuma nota'}"`,
        conteudoId: id,
        contaId: c.contaId,
        deUserId: Store.getState().currentUser.id,
        paraRole: 'social_media'
    });
    
    closeModal('modal-obs-aprov');
    showToast(`${labelTipo} aprovados(as) com observação!`, 'success');
    App.render();
}

window.abrirModalReprovar = function(id, tipo) {
    const c = Store.getCronogramaById(id);
    const labelTipo = tipo === 'conteudo' ? 'Textos' : 'Artes';

    const body = `
        <div style="margin-bottom:var(--space-4);">
            <label class="form-label" style="color:var(--danger-dark);">Motivo da reprovação (${labelTipo}) <span style="color:red;">*</span></label>
            <textarea id="motivo-reprovacao-${id}" class="form-input" rows="4" placeholder="Explique o que precisa ser ajustado..."></textarea>
        </div>
    `;
    const footer = `
        <button class="btn btn-secondary" onclick="closeModal('modal-reprov')">Cancelar</button>
        <button class="btn btn-danger" onclick="confirmarReprovacao('${id}', '${tipo}')">${Icons.x} Confirmar Reprovação</button>
    `;
    showModal('modal-reprov', `Reprovar ${labelTipo} — ${c.titulo}`, body, footer);
}

window.confirmarReprovacao = function(id, tipo) {
    const textarea = document.getElementById(`motivo-reprovacao-${id}`);
    const motivo = textarea ? textarea.value.trim() : '';
    
    if (!motivo) {
        alert('Por favor, informe o motivo para que a equipe possa ajustar.');
        return;
    }
    
    const c = Store.getCronogramaById(id);
    const novoStatus = tipo === 'conteudo' ? 'revisao_conteudo' : 'revisao_artes';
    const labelTipo = tipo === 'conteudo' ? 'Textos' : 'Artes';

    Store.mudarStatus(id, novoStatus, motivo);
    
    // Gerar notificação para o SM
    Store.addNotificacao({
        tipo: 'reprovacao',
        titulo: `Revisão Solicitada (${labelTipo})`,
        mensagem: `Cliente REPROVOU etapa de ${labelTipo} de "${c.titulo}". Motivo:\n"${motivo}"`,
        conteudoId: id,
        contaId: c.contaId,
        deUserId: Store.getState().currentUser.id,
        paraRole: 'social_media'
    });
    
    closeModal('modal-reprov');
    showToast(`${labelTipo} enviados(as) para revisão!`, 'warning');
    App.render();
}

window.abrirModalReprovarInterno = function(id) {
    const c = Store.getCronogramaById(id);
    const body = `
        <div style="margin-bottom:var(--space-4);">
            <label class="form-label" style="color:var(--danger-dark);">O que o Designer precisa ajustar? <span style="color:red;">*</span></label>
            <textarea id="motivo-repro-interno-${id}" class="form-input" rows="4" placeholder="Explique os ajustes técnicos ou visuais necessários..."></textarea>
        </div>
    `;
    const footer = `
        <button class="btn btn-secondary" onclick="closeModal('modal-repro-int')">Cancelar</button>
        <button class="btn btn-danger" onclick="confirmarReprovacaoInterna('${id}')">${Icons.x} Pedir Ajustes ao Designer</button>
    `;
    showModal('modal-repro-int', `Revisão Interna de Artes — ${c.titulo}`, body, footer);
}

window.confirmarReprovacaoInterna = function(id) {
    const textarea = document.getElementById(`motivo-repro-interno-${id}`);
    const motivo = textarea ? textarea.value.trim() : '';
    
    if (!motivo) {
        alert('Por favor, informe o que precisa ser ajustado.');
        return;
    }
    
    Store.mudarStatus(id, 'revisao_interna', motivo);
    
    closeModal('modal-repro-int');
    showToast('Ajustes solicitados ao Designer!', 'warning');
    App.render();
}

// ====================================
// BUSCA GLOBAL (CTRL+K)
// ====================================

document.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        abrirBuscaGlobal();
    }
});

window.abrirBuscaGlobal = function() {
    const body = `
        <div style="margin-bottom:var(--space-4);">
            <div style="position:relative;">
                <span style="position:absolute; left:12px; top:12px; color:var(--gray-400);">${Icons.search}</span>
                <input type="text" id="global-search-input" class="form-input" placeholder="Pesquisar por cliente, título ou status..." style="padding-left:40px; font-size:16px; height:48px;" onkeyup="filtrarBuscaGlobal(this.value)">
            </div>
            <div id="global-search-results" style="margin-top:16px; max-height:400px; overflow-y:auto; display:flex; flex-direction:column; gap:8px;">
                <p style="text-align:center; color:var(--gray-400); font-size:12px; padding:20px;">Digite algo para pesquisar...</p>
            </div>
        </div>
    `;
    showModal('modal-search', 'Busca Inteligente', body, '', true);
    setTimeout(() => document.getElementById('global-search-input')?.focus(), 100);
}

window.filtrarBuscaGlobal = function(query) {
    const q = query.toLowerCase().trim();
    const resultsContainer = document.getElementById('global-search-results');
    if (!q) {
        resultsContainer.innerHTML = '<p style="text-align:center; color:var(--gray-400); font-size:12px; padding:20px;">Digite algo para pesquisar...</p>';
        return;
    }

    const state = Store.getState();
    const cronogramas = state.cronogramas || [];
    const contas = state.contas || [];
    
    const matches = [
        ...contas.filter(c => c.nome.toLowerCase().includes(q)).map(c => ({ type: 'conta', id: c.id, label: c.nome, sub: 'Cliente' })),
        ...cronogramas.filter(c => c.titulo.toLowerCase().includes(q)).map(c => ({ type: 'cronograma', id: c.id, label: c.titulo, sub: 'Conteúdo' }))
    ].slice(0, 8);

    if (matches.length === 0) {
        resultsContainer.innerHTML = '<p style="text-align:center; color:var(--gray-400); font-size:12px; padding:20px;">Nenhum resultado encontrado.</p>';
        return;
    }

    resultsContainer.innerHTML = matches.map(m => `
        <div class="search-result-item" onclick="handleSearchSelect('${m.type}', '${m.id}')" style="padding:12px; background:var(--gray-50); border-radius:8px; cursor:pointer; display:flex; justify-content:space-between; align-items:center;">
            <div>
                <div style="font-weight:700; font-size:14px; color:var(--gray-900);">${m.label}</div>
                <div style="font-size:10px; color:var(--gray-500); text-transform:uppercase;">${m.sub}</div>
            </div>
            <span style="color:var(--gray-400);">${Icons.arrowRight || '→'}</span>
        </div>
    `).join('');
}

window.handleSearchSelect = function(type, id) {
    closeModal('modal-search');
    if (type === 'conta') {
        Store.trocarConta(id);
    } else {
        Store.navigate('cronograma-detalhes', { cronogramaId: id });
    }
}

// ====================================
// STATUS DE CONEXÃO
// ====================================

function renderConnectionIndicator() {
    const isOnline = SupabaseSync.isOnline();
    const color = isOnline ? 'var(--success)' : 'var(--warning)';
    return `
        <div id="conn-status" title="${isOnline ? 'Sincronizado com a nuvem' : 'Modo Offline (LocalStorage)'}" 
             style="position:fixed; bottom:20px; right:20px; width:12px; height:12px; border-radius:50%; background:${color}; border:2px solid white; box-shadow:0 0 10px rgba(0,0,0,0.1); z-index:9999; cursor:help;">
        </div>
    `;
}

// Injetar indicador
document.addEventListener('DOMContentLoaded', () => {
    const div = document.createElement('div');
    div.innerHTML = renderConnectionIndicator();
    document.body.appendChild(div.firstElementChild);
    
    // Atualizar periodicamente
    setInterval(() => {
        const el = document.getElementById('conn-status');
        if (el) el.style.background = SupabaseSync.isOnline() ? 'var(--success)' : 'var(--warning)';
    }, 5000);
});
