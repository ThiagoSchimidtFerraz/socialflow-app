// ====================================
// SOCIALFLOW — Página de Cronogramas
// ====================================

let cronogramaFiltro = 'todos';
let cronogramaMesSelecionado = null; // null = todos os meses

function renderCronogramasPage() {
    const user = Store.getState().currentUser;
    const contaAtiva = Store.getContaAtiva();
    const todosCronogramas = Store.getCronogramas();

    // Filtrar por mês se selecionado
    const cronogramasPorMes = cronogramaMesSelecionado
        ? todosCronogramas.filter(c => c.mesReferencia === cronogramaMesSelecionado)
        : todosCronogramas;

    // Filtrar por status
    const filtrados = cronogramaFiltro === 'todos'
        ? cronogramasPorMes
        : cronogramasPorMes.filter(c => {
            if (cronogramaFiltro === 'aguardando_aprovacao') return c.status && c.status.startsWith('aguardando_aprovacao');
            if (cronogramaFiltro === 'revisao_solicitada') return c.status && c.status.startsWith('revisao');
            if (cronogramaFiltro === 'aprovado') return ['aprovado', 'agendado', 'concluido'].includes(c.status);
            return c.status === cronogramaFiltro;
        });

    const statusCount = {
        todos: cronogramasPorMes.length,
        rascunho: cronogramasPorMes.filter(c => c.status === 'rascunho').length,
        em_producao: cronogramasPorMes.filter(c => c.status === 'em_producao').length,
        aguardando_aprovacao: cronogramasPorMes.filter(c => c.status && c.status.startsWith('aguardando_aprovacao')).length,
        aprovado: cronogramasPorMes.filter(c => ['aprovado', 'agendado', 'concluido'].includes(c.status)).length,
        revisao_solicitada: cronogramasPorMes.filter(c => c.status && c.status.startsWith('revisao')).length,
    };

    // Meses disponíveis para navegação
    const mesesDisponiveis = [...new Set(todosCronogramas.map(c => c.mesReferencia).filter(Boolean))].sort();

    // Gerar anos disponíveis e meses do ano corrente
    const anosDisponiveis = [...new Set(mesesDisponiveis.map(m => m.split('-')[0]))].sort();
    const anoSelecionado = cronogramaMesSelecionado ? cronogramaMesSelecionado.split('-')[0] : (anosDisponiveis[0] || new Date().getFullYear().toString());

    // Todos os 12 meses do ano selecionado
    const mesesDoAno = Array.from({ length: 12 }, (_, i) => {
        const mes = `${anoSelecionado}-${String(i + 1).padStart(2, '0')}`;
        const count = todosCronogramas.filter(c => c.mesReferencia === mes).length;
        return { ref: mes, label: MESES_ABREV[i], count };
    });

    return `
        ${renderSidebar('cronogramas')}
        <main class="main-content">
            <div class="page-header">
                <div>
                    <h1>Conteúdos</h1>
                    <p class="page-header-subtitle">Gerencie os conteúdos mensais da conta</p>
                </div>
                ${user.role === 'social_media' || user.role === 'master' ? `
                    <button class="btn btn-primary" onclick="abrirModalNovoCronograma()">
                        ${Icons.plus} Novo Conteúdo
                    </button>
                ` : ''}
            </div>

            <div class="page-body">
                <!-- Seletor de Ano -->
                ${anosDisponiveis.length > 1 ? `
                    <div class="filters-bar animate-fade-in" style="margin-bottom:var(--space-2);">
                        ${anosDisponiveis.map(ano => `
                            <button class="filter-chip ${anoSelecionado === ano ? 'active' : ''}" onclick="selecionarAno('${ano}')">
                                ${ano}
                            </button>
                        `).join('')}
                    </div>
                ` : ''}

                <!-- Seletor de Mês -->
                <div class="mes-selector animate-fade-in" style="margin-bottom:var(--space-4);">
                    <button class="mes-chip ${!cronogramaMesSelecionado ? 'active' : ''}" onclick="selecionarMes(null)">
                        Todos
                    </button>
                    ${mesesDoAno.map(m => `
                        <button class="mes-chip ${cronogramaMesSelecionado === m.ref ? 'active' : ''} ${m.count === 0 ? 'empty' : ''}" 
                            onclick="selecionarMes('${m.ref}')">
                            ${m.label}
                            ${m.count > 0 ? `<span class="mes-chip-count">${m.count}</span>` : ''}
                        </button>
                    `).join('')}
                </div>

                <!-- Filtros de Status -->
                <div class="filters-bar animate-fade-in" style="animation-delay:0.05s;">
                    <button class="filter-chip ${cronogramaFiltro === 'todos' ? 'active' : ''}" onclick="filtrarCronogramas('todos')">
                        Todos (${statusCount.todos})
                    </button>
                    <button class="filter-chip ${cronogramaFiltro === 'rascunho' ? 'active' : ''}" onclick="filtrarCronogramas('rascunho')">
                        Rascunho (${statusCount.rascunho})
                    </button>
                    <button class="filter-chip ${cronogramaFiltro === 'em_producao' ? 'active' : ''}" onclick="filtrarCronogramas('em_producao')">
                        Em Produção (${statusCount.em_producao})
                    </button>
                    <button class="filter-chip ${cronogramaFiltro === 'aguardando_aprovacao' ? 'active' : ''}" onclick="filtrarCronogramas('aguardando_aprovacao')">
                        Aguardando (${statusCount.aguardando_aprovacao})
                    </button>
                    <button class="filter-chip ${cronogramaFiltro === 'aprovado' ? 'active' : ''}" onclick="filtrarCronogramas('aprovado')">
                        Aprovados (${statusCount.aprovado})
                    </button>
                    <button class="filter-chip ${cronogramaFiltro === 'revisao_solicitada' ? 'active' : ''}" onclick="filtrarCronogramas('revisao_solicitada')">
                        Revisão (${statusCount.revisao_solicitada})
                    </button>
                </div>

                <!-- Indicador de mês selecionado -->
                ${cronogramaMesSelecionado ? `
                    <div class="animate-fade-in" style="margin-bottom:var(--space-4);">
                        <span style="font-size:var(--font-sm); color:var(--gray-500);">
                            Exibindo: <strong style="color:var(--gray-800);">${MESES_LABELS[parseInt(cronogramaMesSelecionado.split('-')[1]) - 1]} ${cronogramaMesSelecionado.split('-')[0]}</strong>
                            · ${statusCount.todos} cronograma(s)
                        </span>
                    </div>
                ` : ''}

                <!-- Lista -->
                <div class="cronogramas-grid animate-fade-in" style="animation-delay:0.1s;">
                    ${filtrados.length > 0 ? filtrados.map((c, i) => `
                        <div style="animation: fadeInUp 0.3s ease ${i * 0.05}s both;">
                            ${renderCronogramaCard(c)}
                        </div>
                    `).join('') : `
                        <div class="card">
                            <div class="empty-state">
                                ${Icons.calendar}
                                <h3>Nenhum cronograma encontrado</h3>
                                <p>${cronogramaMesSelecionado ? 'Não há cronogramas neste mês.' : 'Não há cronogramas com este filtro.'} ${user.role === 'social_media' || user.role === 'master' ? 'Crie um novo para começar!' : ''}</p>
                            </div>
                        </div>
                    `}
                </div>
            </div>
        </main>
    `;
}

function filtrarCronogramas(filtro) {
    cronogramaFiltro = filtro;
    App.render();
}

function selecionarMes(mesRef) {
    cronogramaMesSelecionado = mesRef;
    cronogramaFiltro = 'todos';
    App.render();
}

function selecionarAno(ano) {
    cronogramaMesSelecionado = null;
    // Infer first month by clearing selection
    App.render();
}

function abrirModalNovoCronograma() {
    const body = `
        <form id="form-novo-cronograma" onsubmit="criarCronograma(event)">
            <div class="form-group" style="margin-bottom:var(--space-4);">
                <label class="form-label">Título do Cronograma <span style="color:var(--danger);">*</span></label>
                <input type="text" class="form-input" id="novo-titulo" placeholder="Ex: Campanha de Abril 2026" required>
            </div>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:var(--space-3); margin-bottom:var(--space-4);">
                <div class="form-group">
                    <label class="form-label">Data de Início <span style="color:var(--danger);">*</span></label>
                    <input type="date" class="form-input" id="novo-data-inicio" required>
                </div>
                <div class="form-group">
                    <label class="form-label">Data de Fim <span style="color:var(--danger);">*</span></label>
                    <input type="date" class="form-input" id="novo-data-fim" required>
                </div>
            </div>
            <div class="form-group" style="margin-bottom:var(--space-4);">
                <label class="form-label">Observações Gerais <small style="color:var(--gray-400); font-weight:400;">(opcional)</small></label>
                <textarea class="form-textarea" id="novo-briefing" placeholder="Ex: Planejamento de conteúdo para o mês de Abril, foco em lançamento do produto X..." rows="2"></textarea>
            </div>
        </form>
        <div style="background:var(--primary-50,#eff6ff); border:1px solid var(--primary-200,#bfdbfe); border-radius:var(--radius-md); padding:var(--space-3); margin-top:var(--space-2);">
            <p style="font-size:12px; color:var(--primary-700,#1d4ed8); margin:0;">
                💡 <strong>Cronograma</strong> é a estrutura geral do projeto. Depois de criado, você adiciona os <strong>posts individuais</strong> dentro dele com tema, legenda e briefing de arte.
            </p>
        </div>
    `;

    const footer = `
        <button class="btn btn-secondary" onclick="closeModal('modal-novo-cronograma')">Cancelar</button>
        <button class="btn btn-primary" onclick="document.getElementById('form-novo-cronograma').requestSubmit()">
            ${Icons.plus}
            <span>Criar Cronograma</span>
        </button>
    `;

    showModal('modal-novo-cronograma', 'Novo Cronograma', body, footer);
}

function criarCronograma(e) {
    e.preventDefault();
    const titulo = document.getElementById('novo-titulo').value.trim();
    const briefing = document.getElementById('novo-briefing')?.value.trim() || '';
    const dataInicio = document.getElementById('novo-data-inicio').value;
    const dataFim = document.getElementById('novo-data-fim').value;

    if (!titulo || !dataInicio || !dataFim) {
        showToast('Preencha os campos obrigatórios', 'warning');
        return;
    }

    if (dataFim < dataInicio) {
        showToast('A data de fim não pode ser anterior à data de início', 'warning');
        return;
    }

    const novo = Store.criarCronograma({ 
        titulo, 
        briefing,
        dataInicio,
        dataFim,
    });
    
    closeModal('modal-novo-cronograma');
    showToast('Cronograma criado com sucesso! 🎉', 'success');
    
    // Navegar para os detalhes
    setTimeout(() => {
        Store.navigate('cronograma-detalhes', { cronogramaId: novo.id });
    }, 500);
}
