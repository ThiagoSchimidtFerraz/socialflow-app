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
                            <h1 style="font-size:24px; font-weight:800; color:var(--gray-900); letter-spacing:-0.03em;">${c.titulo}</h1>
                        </div>
                        <p style="font-size:14px; color:var(--gray-500); font-weight:500; margin-top:4px;">${c.briefing || c.descricao}</p>
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
                        ${Icons.calendar} ${c.previsaoPostagem ? `Previsão: ${formatDate(c.previsaoPostagem)}` : `${formatDate(c.dataInicio)}`}
                    </span>
                    <span style="display:flex; align-items:center; gap:8px; font-size:13px; font-weight:500; color:var(--gray-600);">
                        ${Icons.user} Criado por <strong style="color:var(--gray-900); margin-left:4px;">${criador ? criador.nome : 'Sistema'}</strong>
                    </span>
                    <span style="display:flex; align-items:center; gap:8px; font-size:13px; font-weight:500; color:var(--gray-600);">
                        ${Icons.fileText} ${c.copys.length} textos
                    </span>
                    <span style="display:flex; align-items:center; gap:8px; font-size:13px; font-weight:500; color:var(--gray-600);">
                        ${Icons.image} ${c.artes.length} artes
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
                                    <span style="font-size:var(--font-sm); color:var(--gray-500);">Copys</span>
                                    <span style="font-size:var(--font-sm); font-weight:600;">${c.copys.length}</span>
                                </div>
                                <div style="display:flex; justify-content:space-between; padding:var(--space-2) 0; border-bottom:1px solid var(--gray-100);">
                                    <span style="font-size:var(--font-sm); color:var(--gray-500);">Artes</span>
                                    <span style="font-size:var(--font-sm); font-weight:600;">${c.artes.length}</span>
                                </div>
                                <div style="display:flex; justify-content:space-between; padding:var(--space-2) 0; border-bottom:1px solid var(--gray-100);">
                                    <span style="font-size:var(--font-sm); color:var(--gray-500);">Comentários</span>
                                    <span style="font-size:var(--font-sm); font-weight:600;">${c.comentarios.length}</span>
                                </div>
                                <div style="display:flex; justify-content:space-between; padding:var(--space-2) 0;">
                                    <span style="font-size:var(--font-sm); color:var(--gray-500);">${c.previsaoPostagem ? 'Previsão:' : 'Período'}</span>
                                    <span style="font-size:var(--font-sm); font-weight:600;">${c.previsaoPostagem ? formatDate(c.previsaoPostagem) : `${calcDays(c.dataInicio, c.dataFim)} dias`}</span>
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
    const canEditText = isSM;
    const canEditArtes = isSM || isDesigner;

    return `
        <div class="animate-fade-in">
            <!-- CONTEXTO DESIGNER (Apenas para Designer/Admin quando em produção) -->
            ${(user.role === 'designer' || user.role === 'admin' || user.role === 'master') && c.status === 'em_producao' ? `
                <div class="card card-body" style="background:var(--gray-900); color:white; margin-bottom:var(--space-6); border:none;">
                    <h3 style="color:var(--primary-light); font-size:14px; margin-bottom:12px; display:flex; align-items:center; gap:8px;">
                        ${Icons.sparkles} Contexto para Criação
                    </h3>
                    <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px;">
                        <div>
                            <label style="font-size:9px; text-transform:uppercase; color:var(--gray-400); font-weight:700;">Briefing do SM</label>
                            <p style="font-size:12px; line-height:1.5; margin-top:4px;">${c.briefing || 'Nenhuma instrução extra.'}</p>
                        </div>
                        <div>
                            <label style="font-size:9px; text-transform:uppercase; color:var(--gray-400); font-weight:700;">Copy Aprovada</label>
                            <div style="font-size:12px; line-height:1.5; margin-top:4px; max-height:100px; overflow-y:auto; color:var(--gray-200); background:rgba(255,255,255,0.05); padding:8px; border-radius:4px;">
                                ${c.legenda || 'Legenda ainda não definida oficialmente.'}
                            </div>
                        </div>
                    </div>
                </div>
            ` : ''}

            <!-- 1. Seção de Planejamento (Briefing e Legenda) -->
            <div class="card card-body" style="margin-bottom:var(--space-6); border-left:4px solid var(--primary);">
                <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:var(--space-4);">
                    <div>
                        <h3 style="font-size:var(--font-base); font-weight:700; color:var(--gray-900);">Planejamento do Post</h3>
                        <p style="font-size:var(--font-xs); color:var(--gray-500);">Defina o briefing e a legenda final aqui.</p>
                    </div>
                    ${isSM ? `
                        <button class="btn btn-ghost btn-sm" onclick="abrirModalEditarInfo('${c.id}')">
                            ${Icons.edit} Editar Tudo
                        </button>
                    ` : ''}
                </div>

                <div style="display:grid; grid-template-columns: 1fr; gap:var(--space-4);">
                    <div style="background:var(--gray-50); padding:var(--space-3); border-radius:var(--radius-md); border:1px solid var(--gray-100);">
                        <label style="display:block; font-size:10px; font-weight:700; color:var(--primary-dark); text-transform:uppercase; margin-bottom:var(--space-1); letter-spacing:0.05em;">
                            ${Icons.fileText} Briefing / Contexto
                        </label>
                        <div style="font-size:var(--font-sm); color:var(--gray-700); line-height:1.6;">
                            ${c.briefing || '<span style="color:var(--gray-400); font-style:italic;">Nenhum briefing preenchido</span>'}
                        </div>
                    </div>

                    <div style="background:var(--primary-light); padding:var(--space-4); border-radius:var(--radius-md); border:1px dashed var(--primary); position:relative;">
                        <label style="display:block; font-size:10px; font-weight:700; color:var(--primary-dark); text-transform:uppercase; margin-bottom:var(--space-1); letter-spacing:0.05em;">
                            ${Icons.messageSquare} Legenda (Final)
                        </label>
                        <div style="font-size:var(--font-base); font-weight:500; color:var(--gray-900); line-height:1.6; white-space:pre-wrap;">${c.legenda || '<span style="color:var(--gray-400); font-style:italic;">Aguardando a legenda final...</span>'}</div>
                    </div>
                </div>
            </div>

            <!-- 2. Galeria de Artes Integrada -->
            <div style="margin-bottom:var(--space-8);">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:var(--space-4);">
                    <div>
                        <h3 style="font-size:var(--font-base); font-weight:700;">Artes e Criativos</h3>
                        <p style="font-size:var(--font-xs); color:var(--gray-500);">Arquivos finais para este post</p>
                    </div>
                    ${canEditArtes ? `
                        <button class="btn btn-primary btn-sm" onclick="abrirModalNovaArte('${c.id}')">
                            ${Icons.upload} Enviar Arte
                        </button>
                    ` : ''}
                </div>

                <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(220px, 1fr)); gap:var(--space-4);">
                    ${c.artes.length > 0 ? c.artes.map(a => `
                        <div class="card" style="overflow:hidden; border:1px solid var(--gray-200); transition:transform 0.2s; cursor:pointer;" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
                            <div style="aspect-ratio:1; background:var(--gray-100); display:flex; align-items:center; justify-content:center; color:var(--gray-300);">
                                ${a.preview ? `<img src="${a.preview}" style="width:100%; height:100%; object-fit:cover;">` : Icons.image}
                            </div>
                            <div style="padding:var(--space-3); background:var(--white);">
                                <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                                    <div style="font-size:var(--font-xs); font-weight:700; color:var(--gray-800); margin-bottom:4px; word-break:break-all;">${a.nome}</div>
                                    ${canEditArtes ? `
                                        <button class="btn-icon btn-sm" onclick="removerArte('${c.id}', '${a.id}')" title="Remover" style="color:var(--danger);">${Icons.trash}</button>
                                    ` : ''}
                                </div>
                                <div style="display:flex; justify-content:space-between; align-items:center; margin-top:var(--space-2);">
                                    <span style="font-size:10px; color:var(--gray-400); text-transform:uppercase;">${a.tipo}</span>
                                    <div style="display:flex; align-items:center; gap:6px;">
                                        ${a.deadline ? `<span style="font-size:9px; color:var(--danger); font-weight:700;">${Icons.clock} ${formatDate(a.deadline)}</span>` : ''}
                                        <button class="btn btn-ghost btn-xs" style="font-size:10px;">Baixar</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `).join('') : `
                        <div class="card card-body" style="text-align:center; padding:var(--space-8) !important; color:var(--gray-400); grid-column: 1 / -1; border:2px dashed var(--gray-200); background:transparent;">
                            <div style="font-size:32px; margin-bottom:var(--space-2); opacity:0.3;">${Icons.image}</div>
                            <p style="font-size:var(--font-sm);">Nenhuma arte enviada ainda. O time de design cuidará disso!</p>
                        </div>
                    `}
                </div>
            </div>

            <!-- 3. Versões Alternativas (Antiga Tab Copys) -->
            <div style="border-top:1px solid var(--gray-200); padding-top:var(--space-6);">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:var(--space-4);">
                    <h3 style="font-size:var(--font-sm); font-weight:700; color:var(--gray-500); text-transform:uppercase; letter-spacing:0.05em;">Versões de Texto / Histórico de Copys</h3>
                    ${canEditText ? `<button class="btn btn-ghost btn-sm" onclick="abrirModalNovaCopy('${c.id}')">${Icons.plus} Adicionar Versão</button>` : ''}
                </div>
                <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(300px, 1fr)); gap:var(--space-4);">
                    ${c.copys.length > 0 ? c.copys.map(cp => `
                        <div class="card card-body" style="background:var(--gray-50); border:1px solid var(--gray-100);">
                            <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:var(--space-2);">
                                <h4 style="font-size:var(--font-xs); font-weight:700; color:var(--gray-700);">${cp.titulo}</h4>
                                ${canEditText ? `
                                    <div style="display:flex; gap:var(--space-1);">
                                        <button class="btn-icon btn-sm" onclick="abrirModalEditarCopy('${c.id}', '${cp.id}')" title="Editar">${Icons.edit}</button>
                                        <button class="btn-icon btn-sm" onclick="removerCopy('${c.id}', '${cp.id}')" title="Remover" style="color:var(--danger);">${Icons.trash}</button>
                                    </div>
                                ` : ''}
                            </div>
                            <div style="font-size:var(--font-xs); color:var(--gray-600); line-height:1.5; white-space:pre-wrap;">${cp.texto}</div>
                            ${cp.deadline ? `<div style="margin-top:8px; font-size:10px; color:var(--danger); font-weight:700;">Prazo: ${formatDate(cp.deadline)}</div>` : ''}
                        </div>
                    `).join('') : `
                        <p style="font-size:var(--font-xs); color:var(--gray-400); grid-column: 1 / -1;">Nenhuma versão alternativa de texto cadastrada.</p>
                    `}
                </div>
            </div>
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
    
    // Fallback pra cronogramas antigos que usavam 'descricao'
    const currentBriefing = c.briefing !== undefined ? c.briefing : c.descricao || '';
    
    const body = `
        <div class="form-group" style="margin-bottom:var(--space-4);">
            <label class="form-label">Título</label>
            <input type="text" id="edit-info-titulo" class="form-input" value="${c.titulo}">
        </div>
        <div class="form-group" style="margin-bottom:var(--space-4);">
            <label class="form-label">Previsão de Postagem</label>
            <input type="date" id="edit-info-previsao" class="form-input" value="${c.previsaoPostagem || ''}">
        </div>
        <div class="form-group" style="margin-bottom:var(--space-4);">
            <label class="form-label">Briefing (Para o Design / Contexto)</label>
            <textarea id="edit-info-briefing" class="form-input" rows="2">${currentBriefing}</textarea>
        </div>
        <div class="form-group">
            <label class="form-label">Legenda (Copy final)</label>
            <textarea id="edit-info-legenda" class="form-input" rows="3">${c.legenda || ''}</textarea>
        </div>
    `;
    const footer = `
        <button class="btn btn-secondary" onclick="closeModal('modal-edit-info')">Cancelar</button>
        <button class="btn btn-primary" onclick="confirmarEdicaoInfo('${id}')">Salvar</button>
    `;
    showModal('modal-edit-info', 'Editar Informações do Post', body, footer);
};

window.confirmarEdicaoInfo = function(id) {
    const titulo = document.getElementById('edit-info-titulo').value.trim();
    const previsaoPostagem = document.getElementById('edit-info-previsao').value;
    const briefing = document.getElementById('edit-info-briefing').value.trim();
    const legenda = document.getElementById('edit-info-legenda').value.trim();
    
    if (!titulo || !previsaoPostagem || !briefing) return showToast('Título, previsão e briefing são obrigatórios', 'warning');
    
    Store.atualizarCronograma(id, { titulo, previsaoPostagem, briefing, legenda });
    closeModal('modal-edit-info');
    showToast('Post atualizado com sucesso!', 'success');
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
            <input type="date" id="handoff-deadline" class="form-input" value="${c.dataFim}">
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


