// ====================================
// SOCIALFLOW — Calendário de Postagens
// ====================================

let calMesAtual = new Date().getMonth(); // 0-11
let calAnoAtual = new Date().getFullYear();

function renderCalendarioPage() {
    const user = Store.getState().currentUser;
    const contaAtiva = Store.getContaAtiva();
    const cronogramas = Store.getCronogramas();

    const diasNoMes = new Date(calAnoAtual, calMesAtual + 1, 0).getDate();
    const primeiroDia = new Date(calAnoAtual, calMesAtual, 1).getDay(); // 0=Dom
    const hoje = new Date();
    const isHoje = (d) => d === hoje.getDate() && calMesAtual === hoje.getMonth() && calAnoAtual === hoje.getFullYear();

    // Mapear cronogramas nos dias
    const diasMap = {};
    for (let d = 1; d <= diasNoMes; d++) {
        diasMap[d] = [];
    }

    const isAdminMaster = (user.role === 'admin' || user.role === 'master') && !Store.getContaAtiva();

    cronogramas.forEach(c => {
        const inicio = new Date(c.dataInicio);
        // Zerar horas para comparação de dia pura
        inicio.setHours(0,0,0,0);
        
        const fim = new Date(c.dataFim);
        fim.setHours(23,59,59,999);

        for (let d = 1; d <= diasNoMes; d++) {
            const dia = new Date(calAnoAtual, calMesAtual, d);
            if (dia >= inicio && dia <= fim) {
                diasMap[d].push(c);
            }
        }
    });

    const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

    return `
        ${renderSidebar('calendario')}
        <main class="main-content">
            <div class="page-header">
                <div>
                    <h1 style="font-size:24px; font-weight:800; color:var(--gray-900); letter-spacing:-0.03em;">Calendário</h1>
                    <p style="font-size:14px; color:var(--gray-500); font-weight:500; margin-top:4px;">Visualize e gerencie a programação de conteúdos ${contaAtiva ? `da <span style="color:var(--primary); font-weight:700;">${contaAtiva.nome}</span>` : ''}</p>
                </div>
            </div>

            <div class="page-body">
                <!-- Navegação do mês -->
                <div class="animate-fade-in" style="display:flex; align-items:center; justify-content:center; gap:24px; margin-bottom:32px; background:var(--white); padding:16px; border-radius:16px; border:1px solid var(--gray-100); box-shadow:var(--shadow-sm);">
                    <button class="btn-icon" onclick="calMesAnterior()" style="background:var(--gray-50);">
                        ${Icons.chevronLeft}
                    </button>
                    <h2 style="font-size:20px; font-weight:800; color:var(--gray-900); min-width:200px; text-align:center; letter-spacing:-0.02em;">${MESES_LABELS[calMesAtual]} ${calAnoAtual}</h2>
                    <button class="btn-icon" onclick="calMesProximo()" style="background:var(--gray-50);">
                        ${Icons.chevronRight}
                    </button>
                    <button class="btn btn-ghost btn-sm" onclick="calHoje()" style="font-weight:700; color:var(--primary);">Hoje</button>
                </div>

                <!-- Grid do Calendário -->
                <div class="cal-grid animate-fade-in" style="animation-delay:0.1s;">
                    <!-- Cabeçalho dos dias da semana -->
                    ${diasSemana.map(d => `
                        <div class="cal-header-cell">${d}</div>
                    `).join('')}

                    <!-- Células vazias antes do primeiro dia -->
                    ${Array(primeiroDia).fill('').map(() => `
                        <div class="cal-cell cal-cell-empty"></div>
                    `).join('')}

                    <!-- Dias do mês -->
                    ${Array.from({ length: diasNoMes }, (_, i) => i + 1).map(d => {
                        const items = diasMap[d];
                        const hasItems = items.length > 0;
                        const isToday = isHoje(d);
                        return `
                            <div class="cal-cell ${isToday ? 'cal-today' : ''} ${hasItems ? 'cal-has-items' : ''}" 
                                ${hasItems ? `onclick="calMostrarDia(${d})"` : ''}>
                                <div class="cal-day-number ${isToday ? 'cal-day-today' : ''}">${d}</div>
                                ${hasItems ? `
                                    <div class="cal-items">
                                        ${items.slice(0, 3).map(c => {
                                            const conta = Store.getAccountById ? Store.getAccountById(c.contaId) : Store.getContaById(c.contaId);
                                            return `
                                                <div class="cal-item" style="background:${getCalStatusColor(c.status)}; border-left: 2px solid ${conta?.cor || 'var(--primary)'}" title="${c.titulo} — ${STATUS_LABELS[c.status]}">
                                                    ${isAdminMaster ? `<span style="font-size:8px; opacity:0.6; display:block; line-height:1; margin-bottom:1px; text-transform:uppercase; font-weight:800;">${conta?.nome.substring(0, 10)}</span>` : ''}
                                                    <span class="cal-item-text">${c.titulo}</span>
                                                </div>
                                            `;
                                        }).join('')}
                                        ${items.length > 3 ? `
                                            <div class="cal-item-more">+${items.length - 3} mais</div>
                                        ` : ''}
                                    </div>
                                ` : ''}
                            </div>
                        `;
                    }).join('')}
                </div>

                <!-- Legenda -->
                <div class="cal-legend animate-fade-in" style="animation-delay:0.2s;">
                    <span><span class="legend-dot" style="background:var(--gray-400);"></span>Rascunho</span>
                    <span><span class="legend-dot" style="background:#F59E0B;"></span>Aprovar Textos</span>
                    <span><span class="legend-dot" style="background:#EF4444;"></span>Revisão Textos</span>
                    <span><span class="legend-dot" style="background:#3B82F6;"></span>Em Produção</span>
                    <span><span class="legend-dot" style="background:#F59E0B;"></span>Aprovar Artes</span>
                    <span><span class="legend-dot" style="background:#EF4444;"></span>Revisão Artes</span>
                    <span><span class="legend-dot" style="background:#10B981;"></span>Aprovado</span>
                </div>
            </div>
        </main>
    `;
}

function getCalStatusColor(status) {
    const colors = {
        rascunho: 'rgba(156,163,175,0.2)',
        aguardando_aprovacao_conteudo: 'rgba(245,158,11,0.15)',
        revisao_conteudo: 'rgba(239,68,68,0.15)',
        em_producao: 'rgba(59,130,246,0.15)',
        aguardando_aprovacao_artes: 'rgba(245,158,11,0.15)',
        revisao_artes: 'rgba(239,68,68,0.15)',
        aprovado: 'rgba(16,185,129,0.15)',
        agendado: 'rgba(14,165,233,0.15)',
        concluido: 'rgba(34,197,94,0.15)'
    };
    return colors[status] || 'rgba(156,163,175,0.1)';
}

function getCalStatusBorder(status) {
    return getStatusColor(status);
}

function calMesAnterior() {
    calMesAtual--;
    if (calMesAtual < 0) {
        calMesAtual = 11;
        calAnoAtual--;
    }
    App.render();
}

function calMesProximo() {
    calMesAtual++;
    if (calMesAtual > 11) {
        calMesAtual = 0;
        calAnoAtual++;
    }
    App.render();
}

function calHoje() {
    calMesAtual = new Date().getMonth();
    calAnoAtual = new Date().getFullYear();
    App.render();
}

function calMostrarDia(dia) {
    const cronogramas = Store.getCronogramas();
    const diaDate = new Date(calAnoAtual, calMesAtual, dia);

    const dodia = cronogramas.filter(c => {
        const inicio = new Date(c.dataInicio);
        const fim = new Date(c.dataFim);
        return diaDate >= inicio && diaDate <= fim;
    });

    if (dodia.length === 0) return;

    const body = `
        <div style="display:flex; flex-direction:column; gap:12px;">
            ${dodia.map(c => `
                <div class="card card-interactive" style="padding:16px; border-left:4px solid ${getCalStatusBorder(c.status)};" onclick="closeModal('modal-dia'); Store.navigate('cronograma-detalhes', { cronogramaId: '${c.id}' })">
                    <div style="display:flex; align-items:center; gap:16px;">
                        <div style="flex:1;">
                            <div style="font-weight:700; color:var(--gray-900); font-size:14px; margin-bottom:4px;">${c.titulo}</div>
                            <div style="font-size:12px; color:var(--gray-500); font-weight:500;">${formatDate(c.dataInicio)} — ${formatDate(c.dataFim)}</div>
                        </div>
                        ${renderStatusBadge(c.status)}
                    </div>
                </div>
            `).join('')}
        </div>
    `;

    showModal('modal-dia', `${dia} de ${MESES_LABELS[calMesAtual]} de ${calAnoAtual}`, body, `
        <button class="btn btn-secondary" onclick="closeModal('modal-dia')">Fechar</button>
    `);
}
