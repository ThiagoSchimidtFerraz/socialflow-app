// ====================================
// SOCIALFLOW — Detalhes do Cronograma
// ====================================

let detalheTab = 'conteudo';

function renderCronogramaDetalhesPage() {
    const { currentCronogramaId, currentUser } = Store.getState();
    const c = Store.getCronogramaById(currentCronogramaId);

    if (!c) {
        return `
            ${renderSidebar('cronogramas')}
            <main class="main-content">
                <div class="page-body">
                    <div class="card empty-state">
                        ${Icons.alertCircle}
                        <h3>Cronograma não encontrado</h3>
                        <p>O cronograma solicitado não existe.</p>
                        <button class="btn btn-primary" onclick="Store.navigate('cronogramas')" style="margin-top:var(--space-4);">Voltar</button>
                    </div>
                </div>
            </main>
        `;
    }

    const criador = Store.getUserById(c.criadoPor);
    const dataInicioFmt = c.dataInicio ? formatDate(c.dataInicio) : (c.previsaoPostagem ? formatDate(c.previsaoPostagem) : '');
    const dataFimFmt = c.dataFim ? formatDate(c.dataFim) : '';
    const periodo = dataInicioFmt && dataFimFmt ? `${dataInicioFmt} → ${dataFimFmt}` : (dataInicioFmt || 'Sem data definida');

    return `
        ${renderSidebar('cronogramas')}
        <main class="main-content">
            <div class="page-header">
                <div style="display:flex; align-items:center; gap:20px;">
                    <button class="btn-icon" onclick="Store.navigate('cronogramas')" style="background:var(--white); box-shadow:var(--shadow-sm);">
                        ${Icons.arrowLeft}
                    </button>
                    <div>
                        <div style="display:flex; align-items:center; gap:12px;">
                            <h1 style="font-size:24px; font-weight:800; color:var(--gray-900); letter-spacing:-0.03em;">${c.titulo || ''}</h1>
                        </div>
                        <p style="font-size:14px; color:var(--gray-500); font-weight:500; margin-top:4px;">${periodo}</p>
                    </div>
                </div>
                <div style="display:flex; align-items:center; gap:12px;">
                    ${renderStatusBadge(c.status)}
                    ${renderActionButtons(c)}
                </div>
            </div>

            <div class="page-body">
                <!-- Visual Timeline Stepper -->
                <div class="animate-fade-in" style="margin-bottom: var(--space-6);">
                    ${renderCronogramaTimelineSteps(c.status)}
                </div>

                <!-- Meta info -->
                <div class="animate-fade-in" style="display:flex; flex-wrap:wrap; gap:24px; margin-bottom:32px; padding:16px 24px; background:var(--white); border-radius:16px; border:1px solid var(--gray-100); box-shadow:var(--shadow-sm);">
                    <span style="display:flex; align-items:center; gap:8px; font-size:13px; font-weight:700; color:var(--primary);">
                        ${Icons.calendar} ${periodo}
                    </span>
                    <span style="display:flex; align-items:center; gap:8px; font-size:13px; font-weight:500; color:var(--gray-600);">
                        ${Icons.user} Criado por <strong style="color:var(--gray-900); margin-left:4px;">${criador ? criador.nome : 'Sistema'}</strong>
                    </span>
                    <span style="display:flex; align-items:center; gap:8px; font-size:13px; font-weight:500; color:var(--gray-600);">
                        ${Icons.fileText} ${(c.posts || []).length} posts
                    </span>
                    <span style="display:flex; align-items:center; gap:8px; font-size:13px; font-weight:500; color:var(--gray-600);">
                        ${Icons.messageSquare} ${(c.comentarios || []).length} comentários
                    </span>
                </div>

                <!-- Tabs -->
                <div class="tabs animate-fade-in" style="animation-delay:0.05s; margin-bottom:var(--space-6);">
                    <button class="tab ${detalheTab === 'conteudo' ? 'active' : ''}" onclick="mudarTabDetalhe('conteudo')">
                        ${Icons.layout} Conteúdo Principal
                    </button>
                    <button class="tab ${detalheTab === 'comentarios' ? 'active' : ''}" onclick="mudarTabDetalhe('comentarios')">
                        ${Icons.messageSquare} Comentários (${c.comentarios.length})
                    </button>
                    <button class="tab ${detalheTab === 'timeline' ? 'active' : ''}" onclick="mudarTabDetalhe('timeline')">
                        ${Icons.clock} Timeline (${c.timeline.length})
                    </button>
                </div>

                <!-- Conteúdo da tab -->
                <div class="detalhes-grid animate-fade-in" style="animation-delay:0.1s;">
                    <div>
                        ${renderTabContent(c)}
                    </div>

                    <!-- Sidebar com resumo -->
                    <div>
                        <div class="card card-body" style="position:sticky; top:100px;">
                            <h3 style="font-size:var(--font-base); font-weight:700; color:var(--gray-900); margin-bottom:var(--space-4);">
                                Resumo do Projeto
                            </h3>
                            
                            <div style="margin-bottom:var(--space-4);">
                                <div style="display:flex; justify-content:space-between; margin-bottom:var(--space-2);">
                                    <span style="font-size:var(--font-sm); color:var(--gray-500);">Progresso</span>
                                    <span style="font-size:var(--font-sm); font-weight:600; color:var(--gray-700);">${calcProgress(c)}%</span>
                                </div>
                                ${renderProgressBar(calcProgress(c))}
                            </div>

                            <div style="display:flex; flex-direction:column; gap:var(--space-3);">
                                <div style="display:flex; justify-content:space-between; padding:var(--space-2) 0; border-bottom:1px solid var(--gray-100);">
                                    <span style="font-size:var(--font-sm); color:var(--gray-500);">Status</span>
                                    ${renderStatusBadge(c.status)}
                                </div>
                                <div style="display:flex; justify-content:space-between; padding:var(--space-2) 0; border-bottom:1px solid var(--gray-100);">
                                    <span style="font-size:var(--font-sm); color:var(--gray-500);">Posts</span>
                                    <span style="font-size:var(--font-sm); font-weight:600;">${(c.posts || []).length}</span>
                                </div>
                                <div style="display:flex; justify-content:space-between; padding:var(--space-2) 0; border-bottom:1px solid var(--gray-100);">
                                    <span style="font-size:var(--font-sm); color:var(--gray-500);">Comentários</span>
                                    <span style="font-size:var(--font-sm); font-weight:600;">${(c.comentarios || []).length}</span>
                                </div>
                                <div style="display:flex; justify-content:space-between; padding:var(--space-2) 0;">
                                    <span style="font-size:var(--font-sm); color:var(--gray-500);">Período</span>
                                    <span style="font-size:var(--font-sm); font-weight:600;">${periodo}</span>
                                </div>
                            </div>

                            ${c.comentarios.length > 0 ? `
                                <div style="margin-top:var(--space-5); padding-top:var(--space-4); border-top:1px solid var(--gray-100);">
                                    <h4 style="font-size:var(--font-sm); font-weight:600; color:var(--gray-700); margin-bottom:var(--space-3);">Último Comentário</h4>
                                    <div style="background:var(--gray-50); padding:var(--space-3); border-radius:var(--radius-md); font-size:var(--font-sm); color:var(--gray-600); line-height:1.6;">
                                        "${c.comentarios[c.comentarios.length - 1].texto}"
                                        <div style="margin-top:var(--space-2); font-size:var(--font-xs); color:var(--gray-400);">
                                            — ${Store.getUserById(c.comentarios[c.comentarios.length - 1].userId)?.nome}
                                        </div>
                                    </div>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                </div>
            </div>
        </main>
    `;
}

window.renderActionButtons = function(c) {
    const user = Store.getState().currentUser;
    let buttons = '';

    // SM actions
    if (user.role === 'social_media' || user.role === 'admin' || user.role === 'master') {
        // WhatsApp Notification Button
        buttons += `
            <button class="btn btn-sm" onclick="abrirModalWhatsAppIA('${c.id}')" style="background:linear-gradient(135deg, #25D366, #128C7E); border:none; color:white; margin-right:var(--space-2);">
                ${Icons.whatsapp} Notificar via IA
            </button>
        `;

        if (c.status === 'rascunho' || c.status === 'revisao_conteudo') {
            buttons += `<button class="btn btn-warning btn-sm" onclick="mudarStatusCronograma('${c.id}', 'aguardando_aprovacao_conteudo')">${Icons.send} Enviar Conteúdo p/ Cliente</button>`;
        }
        
        if (c.status === 'aguardando_revisao_interna' || c.status === 'revisao_interna') {
            buttons += `<button class="btn btn-success btn-sm" onclick="mudarStatusCronograma('${c.id}', 'aguardando_aprovacao_artes')">${Icons.checkCircle} Aprovar e Enviar p/ Cliente</button>`;
            buttons += `<button class="btn btn-danger btn-sm" onclick="abrirModalReprovarInterno('${c.id}')">${Icons.alertCircle} Pedir Ajuste ao Designer</button>`;
        }

        if (c.status === 'aprovado') {
            buttons += `<button class="btn btn-info btn-sm" onclick="mudarStatusCronograma('${c.id}', 'agendado')">${Icons.clock} Registrar Agendamento</button>`;
        }

        if (c.status === 'agendado') {
            buttons += `<button class="btn btn-success btn-sm" onclick="mudarStatusCronograma('${c.id}', 'concluido')">${Icons.checkCircle} Concluir e Arquivar</button>`;
        }
    }

    // Designer actions
    if (user.role === 'designer' || user.role === 'admin' || user.role === 'master') {
        if (c.status === 'em_producao' || c.status === 'revisao_interna') {
            buttons += `<button class="btn btn-primary btn-sm" onclick="mudarStatusCronograma('${c.id}', 'aguardando_revisao_interna')">${Icons.send} Finalizar Artes p/ Revisão Interna</button>`;
        }
    }

    // Cliente actions
    if (user.role === 'cliente') {
        if (c.status === 'aguardando_aprovacao_conteudo') {
            buttons += `<button class="btn btn-success btn-sm" onclick="aprovarFase('${c.id}', 'conteudo')">${Icons.check} Aprovar Texto</button>`;
            buttons += `<button class="btn btn-danger btn-sm" onclick="abrirModalReprovar('${c.id}', 'conteudo')">${Icons.messageCircle} Pedir Ajuste no Texto</button>`;
        }
        if (c.status === 'aguardando_aprovacao_artes') {
            buttons += `<button class="btn btn-success btn-sm" onclick="aprovarFase('${c.id}', 'artes')">${Icons.check} Aprovar Artes Finais</button>`;
            buttons += `<button class="btn btn-danger btn-sm" onclick="abrirModalReprovar('${c.id}', 'artes')">${Icons.messageCircle} Pedir Ajuste nas Artes</button>`;
        }
    }

    return buttons;
}

window.mudarTabDetalhe = function(tab) {
    detalheTab = tab;
    App.render();
};


function renderTabContent(c) {
    switch (detalheTab) {
        case 'conteudo': return renderConteudoTab(c);
        case 'comentarios': return renderComentariosTab(c);
        case 'timeline': return renderTimelineTab(c);
        default: return '';
    }
}

function renderConteudoTab(c) {
    const user = Store.getState().currentUser;
    const isSM = user.role === 'social_media' || user.role === 'admin' || user.role === 'master';
    const isDesigner = user.role === 'designer' || user.role === 'admin' || user.role === 'master';
    const canEdit = isSM;
    const posts = c.posts || [];

    return `
        <div class="animate-fade-in">
            <!-- OBSERVAÇÕES GERAIS DO CRONOGRAMA -->
            ${(c.briefing || c.descricao) ? `
                <div class="card card-body" style="margin-bottom:var(--space-5); border-left:4px solid var(--primary); background:var(--gray-50);">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:var(--space-2);">
                        <label style="font-size:11px; font-weight:700; color:var(--primary-dark); text-transform:uppercase; letter-spacing:0.05em;">${Icons.fileText} Observações Gerais</label>
                        ${isSM ? `<button class="btn btn-ghost btn-sm" onclick="abrirModalEditarInfo('${c.id}')">${Icons.edit} Editar</button>` : ''}
                    </div>
                    <p style="font-size:var(--font-sm); color:var(--gray-700); line-height:1.6; margin:0;">${c.briefing || c.descricao || ''}</p>
                </div>
            ` : (isSM ? `
                <div style="text-align:center; margin-bottom:var(--space-5);">
                    <button class="btn btn-ghost btn-sm" onclick="abrirModalEditarInfo('${c.id}')">${Icons.edit} Adicionar observações gerais</button>
                </div>
            ` : '')}

            <!-- LISTA DE POSTS INDIVIDUAIS -->
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:var(--space-4);">
                <h3 style="font-size:var(--font-base); font-weight:700; color:var(--gray-900); margin:0;">
                    ${Icons.layout} Posts Individuais
                    <span style="font-size:12px; font-weight:500; color:var(--gray-400); margin-left:8px;">${posts.length} post${posts.length !== 1 ? 's' : ''}</span>
                </h3>
                ${canEdit ? `
                    <button class="btn btn-primary btn-sm" onclick="abrirModalNovoPost('${c.id}')">
                        ${Icons.plus} Novo Post
                    </button>
                ` : ''}
            </div>

            ${posts.length > 0 ? posts.map((p, idx) => `
                <div class="card" style="margin-bottom:var(--space-4); border:1px solid var(--gray-200); overflow:hidden;" id="post-${p.id}">
                    <!-- Header do Post -->
                    <div style="display:flex; align-items:center; justify-content:space-between; padding:16px 20px; background:var(--gray-50); border-bottom:1px solid var(--gray-100);">
                        <div style="display:flex; align-items:center; gap:12px;">
                            <div style="width:28px; height:28px; border-radius:50%; background:var(--primary); color:white; display:flex; align-items:center; justify-content:center; font-size:12px; font-weight:800; flex-shrink:0;">${idx + 1}</div>
                            <div>
                                <div style="font-weight:700; color:var(--gray-900); font-size:15px;">${p.tema || 'Post sem tema'}</div>
                                ${p.dataPostagem ? `<div style="font-size:11px; color:var(--gray-400); margin-top:2px;">${Icons.calendar} Postagem: ${formatDate(p.dataPostagem)}</div>` : ''}
                            </div>
                        </div>
                        ${canEdit ? `
                            <div style="display:flex; gap:6px;">
                                <button class="btn btn-ghost btn-sm" onclick="abrirModalEditarPost('${c.id}', '${p.id}')" title="Editar post">${Icons.edit}</button>
                                <button class="btn btn-ghost btn-sm" style="color:var(--danger);" onclick="excluirPostConfirm('${c.id}', '${p.id}')" title="Excluir post">${Icons.trash}</button>
                            </div>
                        ` : ''}
                    </div>

                    <!-- Corpo do Post -->
                    <div style="padding:20px; display:grid; grid-template-columns:1fr 1fr; gap:20px;">
                        <!-- Legenda -->
                        <div style="background:var(--primary-50,#eff6ff); padding:16px; border-radius:var(--radius-md); border:1px dashed var(--primary-200,#bfdbfe);">
                            <label style="display:block; font-size:10px; font-weight:700; color:var(--primary-dark); text-transform:uppercase; margin-bottom:8px; letter-spacing:0.04em;">${Icons.messageSquare} Legenda (Copy Final)</label>
                            <div style="font-size:var(--font-sm); color:var(--gray-800); line-height:1.7; white-space:pre-wrap;">${p.legenda || '<span style="color:var(--gray-400); font-style:italic;">Aguardando legenda...</span>'}</div>
                        </div>

                        <!-- Briefing para Design -->
                        <div style="background:var(--gray-50); padding:16px; border-radius:var(--radius-md); border:1px solid var(--gray-200);">
                            <label style="display:block; font-size:10px; font-weight:700; color:var(--gray-500); text-transform:uppercase; margin-bottom:8px; letter-spacing:0.04em;">${Icons.edit} Briefing para Design</label>
                            <div style="font-size:var(--font-sm); color:var(--gray-700); line-height:1.6;">${p.briefing || '<span style="color:var(--gray-400); font-style:italic;">Nenhum briefing de arte definido.</span>'}</div>
                        </div>
                    </div>

                    <!-- Arte do Post -->
                    <div style="padding:0 20px 20px;">
                        <label style="display:block; font-size:10px; font-weight:700; color:var(--gray-500); text-transform:uppercase; margin-bottom:10px; letter-spacing:0.04em;">${Icons.image} Arte</label>
                        ${p.linkArte ? `
                            <div style="display:flex; align-items:center; gap:10px; background:var(--gray-50); padding:12px 16px; border-radius:var(--radius-md); border:1px solid var(--gray-200);">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4285F4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
                                <a href="${p.linkArte}" target="_blank" rel="noopener noreferrer" style="font-size:13px; color:var(--primary); font-weight:600; text-decoration:none; flex:1; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">Ver arte no Google Drive</a>
                                ${(canEdit || isDesigner) ? `<button class="btn btn-ghost btn-sm" onclick="abrirModalEnviarArtePost('${c.id}', '${p.id}')" style="flex-shrink:0;">${Icons.edit}</button>` : ''}
                            </div>
                        ` : `
                            <div style="border:2px dashed var(--gray-200); border-radius:var(--radius-md); padding:20px; text-align:center; color:var(--gray-400);">
                                <div style="margin-bottom:8px; opacity:0.5;">${Icons.image}</div>
                                <p style="font-size:12px; margin:0 0 10px;">Arte não enviada ainda</p>
                                ${(canEdit || isDesigner) ? `
                                    <button class="btn btn-primary btn-sm" onclick="abrirModalEnviarArtePost('${c.id}', '${p.id}')">
                                        ${Icons.upload} Enviar Link da Arte
                                    </button>
                                ` : ''}
                            </div>
                        `}
                    </div>
                </div>
            `).join('') : `
                <div class="card card-body" style="text-align:center; padding:var(--space-10) !important; border:2px dashed var(--gray-200); background:transparent;">
                    <div style="font-size:40px; margin-bottom:var(--space-3); opacity:0.3;">${Icons.layout}</div>
                    <h4 style="color:var(--gray-600); margin-bottom:var(--space-2);">Nenhum post criado ainda</h4>
                    <p style="font-size:var(--font-sm); color:var(--gray-400); margin-bottom:var(--space-4);">Adicione os posts individuais com tema, legenda e briefing de arte.</p>
                    ${canEdit ? `<button class="btn btn-primary" onclick="abrirModalNovoPost('${c.id}')">${Icons.plus} Criar Primeiro Post</button>` : ''}
                </div>
            `}
        </div>
    `;
}

// Funções obsoletas removidas (Lógica integrada em renderConteudoTab)


function renderComentariosTab(c) {
    return `
        <div class="animate-fade-in">
            <h3 style="font-size:var(--font-base); font-weight:700; margin-bottom:var(--space-4);">Comentários</h3>
            <div class="card card-body" style="margin-bottom:var(--space-6);">
                <textarea id="novo-comentario" class="form-textarea" placeholder="Adicione uma observação ou sugestão..." style="margin-bottom:var(--space-3);"></textarea>
                <div style="text-align:right;">
                    <button class="btn btn-primary btn-sm" onclick="adicionarComentario('${c.id}')">Enviar Comentário</button>
                </div>
            </div>
            
            <div style="display:flex; flex-direction:column; gap:var(--space-4);">
                ${c.comentarios.length > 0 ? c.comentarios.map(cm => {
                    const u = Store.getUserById(cm.userId);
                    return `
                        <div class="card card-body" style="background:var(--white);">
                            <div style="display:flex; gap:var(--space-3); align-items:flex-start;">
                                ${renderAvatar(u, 32)}
                                <div style="flex:1;">
                                    <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
                                        <strong style="font-size:var(--font-sm); color:var(--gray-900);">${u?.nome}</strong>
                                        <span style="font-size:10px; color:var(--gray-400);">${formatDateTime(cm.criadoEm)}</span>
                                    </div>
                                    <div style="font-size:var(--font-sm); color:var(--gray-700); line-height:1.5;">${cm.texto}</div>
                                </div>
                            </div>
                        </div>
                    `;
                }).reverse().join('') : `
                    <p style="text-align:center; color:var(--gray-400); padding:var(--space-4);">Nenhum comentário ainda.</p>
                `}
            </div>
        </div>
    `;
}

function renderTimelineTab(c) {
    return `
        <div class="animate-fade-in">
            <h3 style="font-size:var(--font-base); font-weight:700; margin-bottom:var(--space-4);">Histórico de Atividades</h3>
            <div class="card card-body">
                <div class="timeline">
                    ${c.timeline.map(a => {
                        const u = Store.getUserById(a.userId);
                        return `
                            <div class="timeline-item">
                                <div class="timeline-dot dot-${a.tipo}"></div>
                                <div class="timeline-content">
                                    <strong>${a.acao}</strong>
                                    <div style="font-size:var(--font-xs); color:var(--gray-500); margin-top:2px;">
                                        Por ${u ? u.nome : 'Sistema'}
                                    </div>
                                    <div class="timeline-time">${formatDateRelative(a.data)}</div>
                                </div>
                            </div>
                        `;
                    }).reverse().join('')}
                </div>
            </div>
        </div>
    `;
}

window.mudarStatusCronograma = function(cronogramaId, novoStatus) {
    console.log('Alterando status:', cronogramaId, novoStatus);
    
    // Fechar dropdown
    const el = document.getElementById('status-dropdown');
    if (el) el.style.display = 'none';

    Store.mudarStatus(cronogramaId, novoStatus);


        
        // Se for o envio de aprovação, envia notificação de push simulada
        if (novoStatus === 'aguardando_aprovacao_conteudo' || novoStatus === 'aguardando_aprovacao_artes') {
            const c = Store.getCronogramaById(cronogramaId);
            const labelAprov = novoStatus === 'aguardando_aprovacao_conteudo' ? 'Textos' : 'Artes Finais';
            Store.addNotificacao({
                tipo: 'aprovacao',
                titulo: `Aprovação Pendente: ${labelAprov}`,
                mensagem: `O material (${labelAprov}) do conteúdo "${c.titulo}" foi liberado para sua aprovação.`,
                conteudoId: cronogramaId,
                contaId: c.contaId,
                deUserId: Store.getState().currentUser.id,
                paraRole: 'cliente'
            });
        }
        
        showToast('Status atualizado! 🚀', 'success');
        App.render();
};


// Comentários
window.adicionarComentario = function(cronogramaId) {
    const textarea = document.getElementById('novo-comentario');
    const texto = textarea?.value.trim();
    if (!texto) {
        showToast('Digite um comentário', 'warning');
        return;
    }
    Store.adicionarComentario(cronogramaId, texto);
    showToast('Comentário adicionado! 💬', 'success');
};


function calcDays(start, end) {
    const diffMs = new Date(end) - new Date(start);
    return Math.max(1, Math.ceil(diffMs / 86400000));
}

window.renderCronogramaTimelineSteps = function(status) {
    const steps = [
        { id: 'rascunho', label: 'Planejamento' },
        { id: 'aguardando_aprovacao_conteudo', label: 'Aprov. Texto' },
        { id: 'em_producao', label: 'Design' },
        { id: 'aguardando_revisao_interna', label: 'Rev. Interna' },
        { id: 'aguardando_aprovacao_artes', label: 'Aprov. Final' },
        { id: 'aprovado', label: 'Aprovadas' },
        { id: 'agendado', label: 'Agendado' }
    ];

    let html = '<div class="animate-fade-in" style="display:flex; justify-content:space-between; background:var(--white); padding:24px; border-radius:24px; border:1px solid var(--gray-100); box-shadow:var(--shadow-sm); margin-bottom:32px;">';
    
    const statusOrder = steps.map(s => s.id);
    let currentIdx = statusOrder.indexOf(status);
    if (status === 'revisao_conteudo') currentIdx = 1;
    if (status === 'revisao_artes') currentIdx = 3;

    steps.forEach((s, idx) => {
        const isActive = idx === currentIdx;
        const isPast = idx < currentIdx;
        const color = isActive ? 'var(--primary)' : (isPast ? 'var(--success)' : 'var(--gray-200)');
        
        html += `
            <div style="display:flex; flex-direction:column; align-items:center; flex:1; position:relative;">
                ${idx < steps.length - 1 ? `<div style="position:absolute; top:12px; left:50%; width:100%; height:2px; background:${isPast ? 'var(--success)' : 'var(--gray-50)'}; z-index:1;"></div>` : ''}
                <div style="width:24px; height:24px; border-radius:50%; background:${color}; color:white; display:flex; align-items:center; justify-content:center; z-index:2; font-size:12px; font-weight:800; box-shadow:${isActive ? '0 0 0 4px var(--primary-50)' : 'none'};">
                    ${isPast ? Icons.check || '✓' : idx + 1}
                </div>
                <div style="font-size:11px; font-weight:700; color:${isActive ? 'var(--primary)' : (isPast ? 'var(--gray-800)' : 'var(--gray-400)')}; margin-top:12px; text-align:center; text-transform:uppercase; letter-spacing:0.02em;">
                    ${s.label}
                </div>
            </div>
        `;
    });

    html += '</div>';
    return html;
};


// Interações de Copy
window.abrirModalNovaCopy = function(cronogramaId) {
    const body = `
        <div class="form-group" style="margin-bottom:var(--space-4);">
            <label class="form-label">Título/Identificação</label>
            <input type="text" id="copy-titulo" class="form-input" placeholder="Ex: Legenda Instagram">
        </div>
        <div class="form-group">
            <label class="form-label">Texto da Legenda</label>
            <textarea id="copy-texto" class="form-input" rows="8" placeholder="Digite o texto aqui..."></textarea>
        </div>
    `;
    const footer = `
        <button class="btn btn-secondary" onclick="closeModal('modal-copy')">Cancelar</button>
        <button class="btn btn-primary" onclick="confirmarNovaCopy('${cronogramaId}')">Criar Copy</button>
    `;
    showModal('modal-copy', 'Nova Copy', body, footer);
};

window.confirmarNovaCopy = function(id) {
    const titulo = document.getElementById('copy-titulo').value.trim();
    const texto = document.getElementById('copy-texto').value.trim();
    if (!titulo || !texto) return alert('Preencha todos os campos');
    Store.adicionarCopy(id, { titulo, texto });
    closeModal('modal-copy');
    App.render();
};

window.abrirModalEditarCopy = function(cronogramaId, copyId) {
    const c = Store.getCronogramaById(cronogramaId);
    const cp = c.copys.find(x => x.id === copyId);
    if (!cp) return;

    const body = `
        <div class="form-group">
            <label class="form-label">Texto da Legenda</label>
            <textarea id="copy-edit-texto" class="form-input" rows="8">${cp.texto}</textarea>
        </div>
    `;
    const footer = `
        <button class="btn btn-secondary" onclick="closeModal('modal-edit-copy')">Cancelar</button>
        <button class="btn btn-primary" onclick="confirmarEdicaoCopy('${cronogramaId}', '${copyId}')">Salvar Alterações</button>
    `;
    showModal('modal-edit-copy', `Editar Copy: ${cp.titulo}`, body, footer);
};

window.confirmarEdicaoCopy = function(cid, cpid) {
    const texto = document.getElementById('copy-edit-texto').value.trim();
    if (!texto) return alert('Texto não pode ser vazio');
    Store.editarCopy(cid, cpid, texto);
    closeModal('modal-edit-copy');
    App.render();
};

window.removerCopy = function(cid, cpid) {
    if (confirm('Deseja remover esta copy permanentemente?')) {
        Store.removerCopy(cid, cpid);
        App.render();
    }
};

// Interações de Arte
window.abrirModalNovaArte = function(cronogramaId) {
    const body = `
        <div class="form-group" style="margin-bottom:var(--space-4);">
            <label class="form-label">Nome da Arte</label>
            <input type="text" id="arte-nome" class="form-input" placeholder="Ex: Banner Stories v1">
        </div>
        <div class="form-group">
            <label class="form-label">Tipo de Arquivo</label>
            <select id="arte-tipo" class="form-input">
                <option value="png">PNG</option>
                <option value="jpg">JPG</option>
                <option value="mp4">MP4 (Vídeo)</option>
            </select>
        </div>
    `;
    const footer = `
        <button class="btn btn-secondary" onclick="closeModal('modal-arte')">Cancelar</button>
        <button class="btn btn-primary" onclick="confirmarNovaArte('${cronogramaId}')">Adicionar Arte</button>
    `;
    showModal('modal-arte', 'Adicionar Arte', body, footer);
};

window.confirmarNovaArte = function(id) {
    const nome = document.getElementById('arte-nome').value.trim();
    const tipo = document.getElementById('arte-tipo').value;
    if (!nome) return alert('Digite o nome da arte');
    Store.adicionarArte(id, { nome, tipo });
    closeModal('modal-arte');
    App.render();
};

window.removerArte = function(cid, aid) {
    if (confirm('Deseja remover esta arte permanentemente?')) {
        Store.removerArte(cid, aid);
        App.render();
    }
};

window.toggleStatusDropdown = function() {
    const el = document.getElementById('status-dropdown');
    if (el) el.style.display = el.style.display === 'none' ? 'block' : 'none';
};

window.abrirModalEditarInfo = function(id) {
    const c = Store.getCronogramaById(id);
    if (!c) return;
    
    const currentBriefing = c.briefing !== undefined ? c.briefing : (c.descricao || '');
    
    const body = `
        <div class="form-group" style="margin-bottom:var(--space-4);">
            <label class="form-label">Título <span style="color:var(--danger);">*</span></label>
            <input type="text" id="edit-info-titulo" class="form-input" value="${c.titulo || ''}">
        </div>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:var(--space-3); margin-bottom:var(--space-4);">
            <div class="form-group">
                <label class="form-label">Data de Início</label>
                <input type="date" id="edit-info-inicio" class="form-input" value="${c.dataInicio || ''}">
            </div>
            <div class="form-group">
                <label class="form-label">Data de Fim</label>
                <input type="date" id="edit-info-fim" class="form-input" value="${c.dataFim || ''}">
            </div>
        </div>
        <div class="form-group">
            <label class="form-label">Observações Gerais <small style="color:var(--gray-400); font-weight:400;">(opcional)</small></label>
            <textarea id="edit-info-briefing" class="form-input" rows="3">${currentBriefing}</textarea>
        </div>
    `;
    const footer = `
        <button class="btn btn-secondary" onclick="closeModal('modal-edit-info')">Cancelar</button>
        <button class="btn btn-primary" onclick="confirmarEdicaoInfo('${id}')">Salvar</button>
    `;
    showModal('modal-edit-info', 'Editar Cronograma', body, footer);
};

window.confirmarEdicaoInfo = function(id) {
    const titulo = document.getElementById('edit-info-titulo').value.trim();
    const dataInicio = document.getElementById('edit-info-inicio').value;
    const dataFim = document.getElementById('edit-info-fim').value;
    const briefing = document.getElementById('edit-info-briefing').value.trim();
    
    if (!titulo) return showToast('Título obrigatório', 'warning');
    
    Store.atualizarCronograma(id, { titulo, dataInicio, dataFim, briefing });
    closeModal('modal-edit-info');
    showToast('Cronograma atualizado!', 'success');
    App.render();
};

// ====================================
// IA WhatsApp Module
// ====================================

window.abrirModalWhatsAppIA = async function(id) {
    const c = Store.getCronogramaById(id);
    if (!c) return;
    
    // Mostrando loading
    const initialBody = `
        <div style="background:linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%); padding:var(--space-4); border-radius:var(--radius-md); margin-bottom:var(--space-4); border:1px solid #a7f3d0;">
            <div style="display:flex; gap:var(--space-3); align-items:flex-start;">
                <div class="loading-spinner" style="width:20px; height:20px; border:2px solid #10b981; border-top-color:transparent; border-radius:50%; animation: spin 1s linear infinite;"></div>
                <div>
                    <h4 style="font-size:var(--font-sm); font-weight:700; color:#065f46; margin-bottom:4px;">A IA está digitando...</h4>
                    <p style="font-size:var(--font-xs); color:#047857;">Aguarde enquanto a inteligência artificial analisa o briefing e os status para criar a melhor mensagem para o WhatsApp do cliente.</p>
                </div>
            </div>
        </div>
    `;
    
    showModal('modal-wa-ia', 'Notificar Cliente (IA)', initialBody, '', true);

    const conta = Store.getContaById(c.contaId);
    const mensagemGerada = await AIService.gerarNotificacaoWhatsApp(c, conta);
    
    // Atualiza Modal
    const finalBody = `
        <div style="background:linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%); padding:var(--space-4); border-radius:var(--radius-md); margin-bottom:var(--space-4); border:1px solid #a7f3d0;">
            <div style="display:flex; gap:var(--space-3); align-items:flex-start;">
                <div style="background:white; width:40px; height:40px; border-radius:50%; display:flex; align-items:center; justify-content:center; color:#10b981; box-shadow:var(--shadow-sm); flex-shrink:0;">
                    ${Icons.sparkles}
                </div>
                <div>
                    <h4 style="font-size:var(--font-sm); font-weight:700; color:#065f46; margin-bottom:4px;">Rascunho Inteligente Concluído</h4>
                    <p style="font-size:var(--font-xs); color:#047857; line-height:1.4;">A IA analisou as propriedades do conteúdo e redigiu esta mensagem incrível. Você pode editá-la conforme achar melhor antes de enviar.</p>
                </div>
            </div>
        </div>
        
        <div class="form-group">
            <textarea id="whatsapp-mensagem" class="form-input" rows="8" style="font-size:14px; line-height:1.6; resize:vertical;">${mensagemGerada}</textarea>
        </div>
    `;
    
    const footer = `
        <button class="btn btn-secondary" onclick="closeModal('modal-wa-ia')">Cancelar</button>
        <button class="btn btn-primary" onclick="dispararWhatsApp('${id}')" style="background:#25D366; border-color:#25D366; color:white; width:auto; padding:0 24px;">
            <svg style="width:16px; height:16px; margin-right:8px;" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
            Abrir WhatsApp
        </button>
    `;
    
    showModal('modal-wa-ia', 'Notificar Cliente (IA)', finalBody, footer, true);
};

function gerarMensagemWhatsAppIA(c) {
    const conta = Store.getContaById(c.contaId);
    
    // Simplified greeting resolver to prevent errors if getGreeting is not globally accessible
    const hour = new Date().getHours();
    let saudacao = 'Olá';
    if (hour < 12) saudacao = 'Bom dia';
    else if (hour < 18) saudacao = 'Boa tarde';
    else saudacao = 'Boa noite';

    const nomeCliente = conta ? conta.nome : 'equipe';
    
    if (c.status === 'rascunho' || c.status === 'revisao_conteudo' || c.status === 'em_producao' || c.status === 'revisao_artes') {
        return `*Atualização | SocialFlow* 🚀\n\n${saudacao}, pessoal da ${nomeCliente}!\nEstamos trabalhando a todo vapor no conteúdo "*${c.titulo}*".\nAssim que os materiais estiverem liberados, avisaremos vocês por aqui para aprovarem na plataforma. Seguimos à disposição! ✨`;
    }
    
    if (c.status === 'aguardando_aprovacao_conteudo') {
        return `*Aprovação de Textos | SocialFlow* 📝\n\n${saudacao}, ${nomeCliente}!\nAcabamos de liberar ${c.copys.length} novo(s) texto(s) para o projeto "*${c.titulo}*".\n\n👉 Por favor, acessem a plataforma para revisar e aprovar as legendas para podermos seguir com as artes.\nQualquer dúvida, é só falar! ⚡`;
    }
    
    if (c.status === 'aguardando_aprovacao_artes') {
        return `*Aprovação de Artes | SocialFlow* 🎨\n\n${saudacao}, ${nomeCliente}!\nTemos novidades visuais! Subimos ${c.artes.length} nova(s) arte(s) para o "*${c.titulo}*".\n\n👉 Entrem na plataforma para dar aquela conferida e aprovar o material final.\nAguardamos o ok de vocês! 🚀`;
    }
    
    if (c.status === 'aprovado') {
        return `*Tudo Aprovado! | SocialFlow* ✅\n\n${saudacao}, equipe!\nO conteúdo "*${c.titulo}*" foi totalmente aprovado por vocês. Nosso time já está preparando o agendamento nas redes.\nObrigado pela parceria! 🤝`;
    }
    
    if (c.status === 'agendado') {
        return `*Posts Agendados | SocialFlow* 🗓️\n\n${saudacao}, ${nomeCliente}!\nPassando para confirmar que o conteúdo "*${c.titulo}*" já está 100% agendado para ir ao ar no período combinado.\n\nPodem ficar tranquilos, cuidaremos de tudo daqui pra frente. 🚀`;
    }
    
    if (c.status === 'concluido') {
        return `*Conteúdo Publicado | SocialFlow* 🎉\n\n${saudacao}! O planejamento de "*${c.titulo}*" foi concluído com sucesso e o conteúdo já está no ar.\nVamos acompanhar os resultados juntos! 📈`;
    }
    
    return `Olá, equipe!\nAqui é do SocialFlow com uma atualização sobre "*${c.titulo}*". Verifiquem a plataforma para mais detalhes!`;
}

window.dispararWhatsApp = function(id) {
    const texto = document.getElementById('whatsapp-mensagem').value;
    if (!texto) return alert('A mensagem não pode estar vazia.');
    
    const link = `https://wa.me/?text=${encodeURIComponent(texto)}`;
    window.open(link, '_blank');
    
    closeModal('modal-wa-ia');
};

window.abrirModalHandoffDesigner = function(id) {
    const c = Store.getCronogramaById(id);
    const body = `
        <div class="form-group" style="margin-bottom:var(--space-4);">
            <label class="form-label">Briefing / Instruções de Arte</label>
            <textarea id="handoff-briefing" class="form-input" rows="4" placeholder="Ex: Preciso de algo minimalista, foco no botão de CTA...">${c.briefing || ''}</textarea>
        </div>
        <div class="form-group">
            <label class="form-label">Prazo para Entrega</label>
            <input type="date" id="handoff-deadline" class="form-input" value="${c.dataFim || ''}">
        </div>
    `;
    const footer = `
        <button class="btn btn-secondary" onclick="closeModal('modal-handoff')">Cancelar</button>
        <button class="btn btn-primary" onclick="confirmarHandoff('${id}')">Enviar para Design 🎨</button>
    `;
    showModal('modal-handoff', 'Handoff: Enviar para Designer', body, footer);
}

window.confirmarHandoff = function(id) {
    const briefing = document.getElementById('handoff-briefing').value;
    const deadline = document.getElementById('handoff-deadline').value;
    
    Store.atualizarCronograma(id, { briefing, status: 'em_producao' });
    showToast('Enviado para o Designer! 🎨', 'success');
    closeModal('modal-handoff');
    App.render();
}

// ====================================
// POSTS INDIVIDUAIS
// ====================================

window.abrirModalNovoPost = function(cronogramaId) {
    const body = `
        <div class="form-group" style="margin-bottom:var(--space-4);">
            <label class="form-label">Tema / Conteúdo <span style="color:var(--danger);">*</span></label>
            <input type="text" id="post-tema" class="form-input" placeholder="Ex: Lançamento do produto X, Dica de segunda-feira..." required>
        </div>
        <div class="form-group" style="margin-bottom:var(--space-4);">
            <label class="form-label">Data de Postagem</label>
            <input type="date" id="post-data" class="form-input">
        </div>
        <div class="form-group" style="margin-bottom:var(--space-4);">
            <label class="form-label">Legenda (Copy Final)</label>
            <textarea id="post-legenda" class="form-textarea" rows="4" placeholder="Escreva a legenda final que irá no post..."></textarea>
        </div>
        <div class="form-group" style="margin-bottom:var(--space-4);">
            <label class="form-label">Briefing para o Design</label>
            <textarea id="post-briefing" class="form-textarea" rows="2" placeholder="Dê instruções visuais para o designer: cores, estilo, formato..."></textarea>
        </div>
        <div class="form-group">
            <label class="form-label">Link da Arte (Google Drive)</label>
            <input type="url" id="post-link-arte" class="form-input" placeholder="https://drive.google.com/...">
            <small style="color:var(--gray-400); font-size:11px; margin-top:4px; display:block;">O designer pode preencher este campo com o link da arte finalizada.</small>
        </div>
    `;
    const footer = `
        <button class="btn btn-secondary" onclick="closeModal('modal-novo-post')">Cancelar</button>
        <button class="btn btn-primary" onclick="confirmarNovoPost('${cronogramaId}')">${Icons.plus} Adicionar Post</button>
    `;
    showModal('modal-novo-post', 'Novo Post Individual', body, footer);
};

window.confirmarNovoPost = function(cronogramaId) {
    const tema = document.getElementById('post-tema').value.trim();
    const legenda = document.getElementById('post-legenda').value.trim();
    const briefing = document.getElementById('post-briefing').value.trim();
    const linkArte = document.getElementById('post-link-arte').value.trim();
    const dataPostagem = document.getElementById('post-data').value;

    if (!tema) {
        showToast('O tema do post é obrigatório', 'warning');
        return;
    }

    Store.criarPost(cronogramaId, { tema, legenda, briefing, linkArte, dataPostagem });
    closeModal('modal-novo-post');
    showToast('Post adicionado! 🎉', 'success');
    App.render();
};

window.abrirModalEditarPost = function(cronogramaId, postId) {
    const c = Store.getCronogramaById(cronogramaId);
    if (!c || !c.posts) return;
    const p = c.posts.find(x => x.id === postId);
    if (!p) return;

    const body = `
        <div class="form-group" style="margin-bottom:var(--space-4);">
            <label class="form-label">Tema / Conteúdo <span style="color:var(--danger);">*</span></label>
            <input type="text" id="edit-post-tema" class="form-input" value="${p.tema || ''}">
        </div>
        <div class="form-group" style="margin-bottom:var(--space-4);">
            <label class="form-label">Data de Postagem</label>
            <input type="date" id="edit-post-data" class="form-input" value="${p.dataPostagem || ''}">
        </div>
        <div class="form-group" style="margin-bottom:var(--space-4);">
            <label class="form-label">Legenda (Copy Final)</label>
            <textarea id="edit-post-legenda" class="form-textarea" rows="4">${p.legenda || ''}</textarea>
        </div>
        <div class="form-group" style="margin-bottom:var(--space-4);">
            <label class="form-label">Briefing para o Design</label>
            <textarea id="edit-post-briefing" class="form-textarea" rows="2">${p.briefing || ''}</textarea>
        </div>
        <div class="form-group">
            <label class="form-label">Link da Arte (Google Drive)</label>
            <input type="url" id="edit-post-link-arte" class="form-input" value="${p.linkArte || ''}" placeholder="https://drive.google.com/...">
        </div>
    `;
    const footer = `
        <button class="btn btn-secondary" onclick="closeModal('modal-edit-post')">Cancelar</button>
        <button class="btn btn-primary" onclick="confirmarEdicaoPost('${cronogramaId}', '${postId}')">${Icons.check} Salvar Alterações</button>
    `;
    showModal('modal-edit-post', 'Editar Post', body, footer);
};

window.confirmarEdicaoPost = function(cronogramaId, postId) {
    const tema = document.getElementById('edit-post-tema').value.trim();
    const legenda = document.getElementById('edit-post-legenda').value.trim();
    const briefing = document.getElementById('edit-post-briefing').value.trim();
    const linkArte = document.getElementById('edit-post-link-arte').value.trim();
    const dataPostagem = document.getElementById('edit-post-data').value;

    if (!tema) {
        showToast('O tema não pode estar vazio', 'warning');
        return;
    }

    Store.atualizarPost(cronogramaId, postId, { tema, legenda, briefing, linkArte, dataPostagem });
    closeModal('modal-edit-post');
    showToast('Post atualizado!', 'success');
    App.render();
};

window.abrirModalEnviarArtePost = function(cronogramaId, postId) {
    const c = Store.getCronogramaById(cronogramaId);
    if (!c || !c.posts) return;
    const p = c.posts.find(x => x.id === postId);
    if (!p) return;

    const body = `
        <div style="margin-bottom:var(--space-4);">
            <p style="font-size:13px; color:var(--gray-600); margin-bottom:var(--space-3);">Cole abaixo o link do <strong>Google Drive</strong> ou qualquer serviço de armazenamento com a arte finalizada:</p>
            <div class="form-group">
                <label class="form-label">Link da Arte</label>
                <input type="url" id="arte-post-link" class="form-input" value="${p.linkArte || ''}" placeholder="https://drive.google.com/file/...">
            </div>
        </div>
        <div style="background:var(--gray-50); border-radius:var(--radius-md); padding:var(--space-3); font-size:12px; color:var(--gray-500);">
            💡 <strong>Dica:</strong> No Google Drive, clique em <em>Compartilhar</em> e copie o link público.
        </div>
    `;
    const footer = `
        <button class="btn btn-secondary" onclick="closeModal('modal-arte-post')">Cancelar</button>
        <button class="btn btn-primary" onclick="confirmarArtePost('${cronogramaId}', '${postId}')">${Icons.upload} Salvar Link</button>
    `;
    showModal('modal-arte-post', `Arte do Post: ${p.tema || 'Post'}`, body, footer);
};

window.confirmarArtePost = function(cronogramaId, postId) {
    const linkArte = document.getElementById('arte-post-link').value.trim();
    Store.atualizarPost(cronogramaId, postId, { linkArte });
    closeModal('modal-arte-post');
    showToast('Link da arte salvo! 🎨', 'success');
    App.render();
};

window.excluirPostConfirm = function(cronogramaId, postId) {
    const c = Store.getCronogramaById(cronogramaId);
    if (!c || !c.posts) return;
    const p = c.posts.find(x => x.id === postId);
    const tema = p ? (p.tema || 'este post') : 'este post';
    if (confirm(`Deseja excluir "${tema}" permanentemente?`)) {
        Store.excluirPost(cronogramaId, postId);
        showToast('Post removido.', 'info');
        App.render();
    }
};
