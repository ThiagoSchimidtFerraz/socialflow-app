// ====================================
// SOCIALFLOW — Página de Aprovações
// ====================================

function renderAprovacoesPage() {
    const user = Store.getState().currentUser;
    let cronogramas = Store.getCronogramas();

    // Filtro de Segurança: Cliente só vê o que é da conta dele
    if (user.role === 'cliente') {
        cronogramas = cronogramas.filter(c => user.contasIds.includes(c.contaId));
    }

    const pendentes = cronogramas.filter(c => c.status && c.status.startsWith('aguardando_aprovacao'));
    const revisao = cronogramas.filter(c => c.status && c.status.startsWith('revisao'));
    const aprovados = cronogramas.filter(c => c.status === 'aprovado' || c.status === 'agendado' || c.status === 'concluido');

    return `
        ${renderSidebar('aprovacoes')}
        <main class="main-content">
            <div class="page-header">
                <div>
                    <h1 style="font-size:24px; font-weight:800; color:var(--gray-900); letter-spacing:-0.03em;">Aprovações</h1>
                    <p style="font-size:14px; color:var(--gray-500); font-weight:500; margin-top:4px;">Gerencie as aprovações de conteúdo e design</p>
                </div>
                <div style="display:flex; align-items:center; gap:12px;">
                    <span class="badge" style="background:var(--warning-50); color:var(--warning-700); border:1px solid var(--warning-200); font-weight:700; padding:6px 16px;">
                        ${pendentes.length} pendente(s)
                    </span>
                </div>
            </div>

            <div class="page-body">
                <!-- Pendentes -->
                ${pendentes.length > 0 ? `
                    <div class="animate-fade-in" style="margin-bottom:var(--space-8);">
                        <h2 class="dashboard-section-title" style="color:var(--warning-dark);">
                            ${Icons.clock} Aguardando sua Aprovação
                        </h2>
                        ${pendentes.map((c, i) => renderAprovacaoCard(c, i)).join('')}
                    </div>
                ` : ''}

                <!-- Em revisão -->
                ${revisao.length > 0 ? `
                    <div class="animate-fade-in" style="animation-delay:0.1s; margin-bottom:var(--space-8);">
                        <h2 class="dashboard-section-title" style="color:var(--danger-dark);">
                            ${Icons.alertCircle} Revisão Solicitada
                        </h2>
                        ${revisao.map((c, i) => renderAprovacaoCard(c, i, true)).join('')}
                    </div>
                ` : ''}

                <!-- Aprovados Recentes -->
                ${aprovados.length > 0 ? `
                    <div class="animate-fade-in" style="animation-delay:0.2s;">
                        <h2 class="dashboard-section-title" style="color:var(--success-dark);">
                            ${Icons.checkCircle} Finalizados Recentemente
                        </h2>
                        ${aprovados.slice(0, 10).map((c, i) => `
                            <div class="card aprovacao-card" style="opacity:0.7; margin-bottom:var(--space-3);">
                                <div style="display:flex; align-items:center; justify-content:space-between;">
                                    <div>
                                        <h3 class="aprovacao-title" style="font-size:var(--font-base);">${c.titulo}</h3>
                                        <div style="font-size:var(--font-xs); color:var(--gray-400); margin-top:var(--space-1);">
                                            ${c.copys.length} copys · ${c.artes.length} artes
                                        </div>
                                    </div>
                                    <div style="display:flex; align-items:center; gap:var(--space-3);">
                                        ${renderStatusBadge(c.status)}
                                        <button class="btn btn-ghost btn-sm" onclick="Store.navigate('cronograma-detalhes', { cronogramaId: '${c.id}' })">
                                            ${Icons.eye} Ver Detalhes
                                        </button>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                ` : ''}

                <!-- Vazio -->
                ${pendentes.length === 0 && revisao.length === 0 && aprovados.length === 0 ? `
                    <div class="card empty-state animate-fade-in">
                        ${Icons.checkCircle}
                        <h3>Nenhuma aprovação pendente</h3>
                        <p>Você está em dia! Todos os cronogramas foram processados.</p>
                    </div>
                ` : ''}
            </div>
        </main>
    `;
}

function renderAprovacaoCard(c, index, isRevisao = false) {
    const criador = Store.getUserById(c.criadoPor);
    
    return `
        <div class="card animate-fade-in" style="padding:24px; margin-bottom:20px; animation-delay:${index * 0.05}s; border:1px solid var(--gray-100); box-shadow:var(--shadow-sm);">
            <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:20px;">
                <div>
                    <h3 style="font-size:18px; font-weight:800; color:var(--gray-900); letter-spacing:-0.03em;">${c.titulo}</h3>
                    <div style="display:flex; gap:16px; margin-top:8px; font-size:12px; font-weight:500; color:var(--gray-500);">
                        <span style="display:flex; align-items:center; gap:4px; color:var(--primary); font-weight:700;">${Icons.calendar} ${formatDate(c.previsaoPostagem)}</span>
                        <span style="display:flex; align-items:center; gap:4px;">${Icons.user} ${criador?.nome || 'Sistema'}</span>
                    </div>
                </div>
                ${renderStatusBadge(c.status)}
            </div>

            <div style="display:grid; grid-template-columns: 1.2fr 1fr; gap:32px; margin-bottom:24px;">
                <div style="padding-right:32px; border-right:1px solid var(--gray-50);">
                    <h4 style="font-size:11px; font-weight:800; color:var(--gray-400); text-transform:uppercase; letter-spacing:0.1em; margin-bottom:12px; display:flex; align-items:center; gap:8px;">
                        ${Icons.fileText} TEXTOS (${c.copys.length})
                    </h4>
                    ${c.copys.length > 0 ? c.copys.slice(0, 1).map(cp => `
                        <div style="background:var(--gray-25); border-radius:12px; padding:16px; border:1px solid var(--gray-50);">
                            <div style="font-size:13px; font-weight:700; color:var(--gray-900); margin-bottom:8px;">${cp.titulo}</div>
                            <div style="font-size:14px; color:var(--gray-600); line-height:1.6; white-space:pre-wrap;">${cp.texto}</div>
                        </div>
                    `).join('') : '<p style="font-size:12px; color:var(--gray-400);">Nenhuma copy definida</p>'}
                </div>

                <div>
                    <h4 style="font-size:11px; font-weight:800; color:var(--gray-400); text-transform:uppercase; letter-spacing:0.1em; margin-bottom:12px; display:flex; align-items:center; gap:8px;">
                        ${Icons.image} ARTES (${c.artes.length})
                    </h4>
                    ${c.artes.length > 0 ? `
                        <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(90px, 1fr)); gap:12px;">
                            ${c.artes.slice(0, 4).map(a => `
                                <div style="aspect-ratio:1; background:var(--gray-50); border-radius:8px; display:flex; flex-direction:column; align-items:center; justify-content:center; border:1px solid var(--gray-100);">
                                    <div style="color:var(--gray-300);">${Icons.image}</div>
                                    <span style="font-size:9px; color:var(--gray-500); margin-top:4px; text-align:center; font-weight:600; padding:0 4px;">${a.nome.substring(0, 12)}</span>
                                </div>
                            `).join('')}
                        </div>
                    ` : '<p style="font-size:12px; color:var(--gray-400);">Aguardando artes</p>'}
                </div>
            </div>

            ${isRevisao && c.comentarios.length > 0 ? `
                <div style="background:var(--danger-25); border-radius:12px; padding:16px; margin-bottom:24px; border:1px solid var(--danger-50); border-left:4px solid var(--danger);">
                    <div style="font-size:11px; font-weight:800; color:var(--danger); text-transform:uppercase; margin-bottom:4px;">Motivo da revisão:</div>
                    <div style="font-size:14px; font-weight:500; color:var(--gray-700);">"${c.comentarios[c.comentarios.length - 1].texto}"</div>
                </div>
            ` : ''}

            <div style="display:flex; justify-content:space-between; align-items:center; padding-top:20px; border-top:1px solid var(--gray-50);">
                <button class="btn btn-ghost btn-sm" onclick="Store.navigate('cronograma-detalhes', { cronogramaId: '${c.id}' })" style="color:var(--gray-500);">
                    ${Icons.eye} Ver Completo
                </button>
                ${!isRevisao ? `
                    <div style="display:flex; gap:12px;">
                        <button class="btn btn-danger btn-sm" onclick="abrirModalRevisao('${c.id}')">
                            ${Icons.alertCircle} Solicitar Revisão
                        </button>
                        <button class="btn btn-success btn-sm" onclick="aprovarCronograma('${c.id}')" style="padding:0 24px;">
                            ${Icons.check} Aprovar Agora
                        </button>
                    </div>
                ` : ''}
            </div>
        </div>
    `;
}
