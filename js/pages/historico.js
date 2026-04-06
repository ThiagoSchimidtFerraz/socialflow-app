// ====================================
// SOCIALFLOW — Histórico
// ====================================

function renderHistoricoPage() {
    const user = Store.getState().currentUser;
    const contaAtiva = Store.getContaAtiva();
    
    // Pegar cronogramas concluídos da conta ativa (ou todas se for admin e não tiver selecionado)
    let cronogramas = [];
    if (user.role === 'admin' && !contaAtiva) {
        cronogramas = Store.getAllCronogramas();
    } else if (contaAtiva) {
        cronogramas = Store.getCronogramasDaConta(contaAtiva.id);
    } else {
        cronogramas = Store.getCronogramas();
    }

    const concluidos = cronogramas.filter(c => c.status === 'concluido');
    
    // Obter todas as atividades de todos os cronogramas (não apenas os concluídos, mas todo histórico da conta)
    const todasAtividades = [];
    cronogramas.forEach(c => {
        c.timeline.forEach(t => {
            todasAtividades.push({ ...t, cronogramaTitulo: c.titulo, cronogramaId: c.id });
        });
    });
    todasAtividades.sort((a, b) => new Date(b.data) - new Date(a.data));

    return `
        ${renderSidebar('historico')}
        <main class="main-content">
            <div class="page-header">
                <div>
                    <h1>Histórico Geral</h1>
                    <p class="page-header-subtitle">Conteúdos finalizados e registro de atividades ${contaAtiva ? `· <strong>${contaAtiva.nome}</strong>` : ''}</p>
                </div>
            </div>

            <div class="page-body">
                <div class="dashboard-cliente-layout">
                    <!-- Coluna Principal: Conteúdos Concluídos -->
                    <div class="cliente-main-col">
                        <section style="margin-bottom:var(--space-8);">
                            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:var(--space-4);">
                                <h2 class="dashboard-section-title" style="margin:0;">
                                    ${Icons.archive} Projetos Concluídos
                                    <span class="badge badge-success" style="margin-left:8px;">${concluidos.length}</span>
                                </h2>
                            </div>
                            
                            <div style="display:flex; flex-direction:column; gap:var(--space-4);">
                                ${concluidos.length > 0 ? concluidos.map(c => `
                                    <div class="card card-body card-interactive" style="border-left: 4px solid var(--success);" onclick="Store.navigate('cronograma-detalhes', { cronogramaId: '${c.id}' })">
                                        <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                                            <div>
                                                <h3 style="margin-bottom:4px; color:var(--gray-900); font-size:var(--font-lg);">${c.titulo}</h3>
                                                <div style="display:flex; gap:var(--space-3); font-size:var(--font-sm); color:var(--gray-500); margin-bottom:var(--space-3);">
                                                    <span style="display:flex; align-items:center; gap:4px;">${Icons.calendar} Publicado em: ${formatDate(c.dataFim)}</span>
                                                    <span style="display:flex; align-items:center; gap:4px;">${Icons.image} ${c.artes?.length || 0} artes</span>
                                                </div>
                                                <p style="font-size:var(--font-sm); color:var(--gray-600);">${c.descricao}</p>
                                            </div>
                                            ${renderStatusBadge(c.status)}
                                        </div>
                                    </div>
                                `).join('') : `
                                    <div class="card card-body" style="text-align:center; padding:var(--space-8) !important;">
                                        <div style="font-size:48px; margin-bottom:var(--space-4); color:var(--gray-300);">${Icons.archive}</div>
                                        <h3 style="color:var(--gray-600); margin-bottom:var(--space-2);">Nenhum conteúdo concluído ainda.</h3>
                                        <p style="color:var(--gray-400);">Os conteúdos aparecerão aqui quando chegarem na última etapa.</p>
                                    </div>
                                `}
                            </div>
                        </section>
                    </div>

                    <!-- Coluna Secundária: Log Global -->
                    <div class="cliente-side-col">
                        <h2 class="dashboard-section-title" style="margin-bottom:var(--space-4);">
                            ${Icons.clock} Registro de Atividades
                        </h2>
                        <div class="card card-body" style="max-height: 80vh; overflow-y:auto;">
                            ${todasAtividades.length > 0 ? `
                                <div class="timeline">
                                    ${todasAtividades.slice(0, 50).map(a => {
                                        const u = Store.getUserById(a.userId);
                                        return `
                                            <div class="timeline-item">
                                                <div class="timeline-dot dot-${a.tipo}"></div>
                                                <div class="timeline-content">
                                                    <strong>${a.acao}</strong>
                                                    <div style="font-size:var(--font-xs); color:var(--gray-500); margin-top:2px; cursor:pointer;" onclick="Store.navigate('cronograma-detalhes', { cronogramaId: '${a.cronogramaId}' })">
                                                        <em>${a.cronogramaTitulo}</em>
                                                    </div>
                                                    <div style="font-size:var(--font-xs); color:var(--gray-400); margin-top:2px;">
                                                        Por ${u ? u.nome : 'Sistema'} · <span class="timeline-time">${formatDateRelative(a.data)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        `;
                                    }).join('')}
                                </div>
                            ` : `
                                <div style="padding:var(--space-6); text-align:center; color:var(--gray-400); font-size:var(--font-sm);">
                                    Nenhuma atividade registrada.
                                </div>
                            `}
                        </div>
                    </div>
                </div>
            </div>
        </main>
    `;
}
