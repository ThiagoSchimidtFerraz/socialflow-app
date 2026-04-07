// ====================================
// SOCIALFLOW — Dashboard
// ====================================

function renderDashboard() {
    const user = Store.getState().currentUser;
    if (user.role === 'cliente') return renderDashboardCliente();
    if (user.role === 'designer') return renderDashboardDesigner();
    if (user.role === 'social_media') return renderDashboardSocialMedia();
    if (typeof window.dashMesAtual === 'undefined') {
        window.dashMesAtual = new Date().getMonth();
        window.dashAnoAtual = new Date().getFullYear();
    }

    const todosCronogramas = Store.getCronogramas();
    
    // Filtro para a visualização da Timeline (mês a mês)
    const cronogramasMes = todosCronogramas.filter(c => {
        const d = new Date(c.dataInicio);
        return d.getMonth() === window.dashMesAtual && d.getFullYear() === window.dashAnoAtual;
    });

    // Últimas atividades — pegar as 8 mais recentes globais
    const todasAtividades = [];
    todosCronogramas.forEach(c => {
        c.timeline.forEach(t => {
            todasAtividades.push({ ...t, cronogramaTitulo: c.titulo, cronogramaId: c.id });
        });
    });
    todasAtividades.sort((a, b) => new Date(b.data) - new Date(a.data));
    const ultimasAtividades = todasAtividades.slice(0, 8);

    // Próximos cronogramas ativos (ignorar os finalizados para não poluir a tela principal)
    const proximos = todosCronogramas
        .filter(c => c.status !== 'concluido' && c.status !== 'agendado')
        .sort((a, b) => new Date(a.dataInicio) - new Date(b.dataInicio))
        .slice(0, 5);

    const contaAtiva = Store.getContaAtiva();

    return `
        ${renderSidebar('dashboard')}
        <main class="main-content">
            <div class="page-header">
                <div>
                    <h1>Visão de Liderança</h1>
                    <p style="font-size:14px; color:var(--gray-500); font-weight:500;">Bem-vindo(a), ${user.nome}! ${getGreeting()} ${contaAtiva ? `· <span style="color:var(--primary); font-weight:700;">${contaAtiva.nome}</span>` : ''}</p>
                </div>
            </div>

            <div class="page-body">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:var(--space-4);">
                    <h2 class="dashboard-section-title" style="margin:0;">
                        ${Icons.barChart} Fluxo de Produção (Mês)
                    </h2>
                    <div style="display:flex; align-items:center; gap:var(--space-2); background:var(--white); padding:4px 8px; border-radius:var(--radius-md); border:none;">
                        <button class="btn btn-ghost btn-sm" onclick="dashMesAnterior()" style="padding:4px;">${Icons.chevronLeft}</button>
                        <div style="font-weight:600; font-size:13px; min-width:100px; text-align:center;">${MESES_LABELS[window.dashMesAtual]} ${window.dashAnoAtual}</div>
                        <button class="btn btn-ghost btn-sm" onclick="dashMesProximo()" style="padding:4px;">${Icons.chevronRight}</button>
                    </div>
                </div>

                <!-- Alerta Inteligente Agência -->
                ${renderIntelligenceAlerts()}

                <!-- Stats Globais (Agência) -->
                ${renderDashboardTimelineStats(cronogramasMes)}

                <!-- Grid principal exclusivo de Liderança -->
                <div class="dashboard-grid">
                    <!-- Próximos cronogramas -->
                    <div class="animate-fade-in" style="animation-delay: 0.1s;">
                        <h2 class="dashboard-section-title">
                            ${Icons.calendar}
                            Conteúdos Ativos
                        </h2>
                        <div class="cronogramas-grid">
                            ${proximos.length > 0 ? proximos.map(c => renderCronogramaCard(c)).join('') : `
                                <div class="card">
                                    <div class="empty-state" style="padding: var(--space-8);">
                                        ${Icons.calendar}
                                        <h3>Nenhum conteúdo ativo</h3>
                                        <p>Comece criando um novo conteúdo</p>
                                    </div>
                                </div>
                            `}
                        </div>
                    </div>

                    <!-- Assistente de Conteúdo IA — Chat Conversacional (Social Media e Master) -->
                    ${user.role === 'social_media' || user.role === 'master' ? `
                    <div class="animate-fade-in" style="animation-delay: 0.12s; margin-top:var(--space-6); margin-bottom:var(--space-6);">
                        <h2 class="dashboard-section-title" style="color:var(--primary-dark);">
                            ${Icons.sparkles} Assistente de Conteúdo IA
                            <span class="badge" style="font-size:10px; padding:2px 8px; background:linear-gradient(135deg, #a855f7, #3b82f6); color:white; margin-left:8px;">Chat Gemini</span>
                        </h2>
                        <div class="card" style="overflow:hidden; display:flex; flex-direction:column; height:480px;">
                            <!-- Chat Messages -->
                            <div id="ia-chat-messages" style="flex:1; overflow-y:auto; padding:var(--space-4); display:flex; flex-direction:column; gap:var(--space-3); background:var(--gray-50);">
                                <div class="ia-chat-msg ia-chat-bot">
                                    <div class="ia-chat-avatar" style="background:linear-gradient(135deg, #a855f7, #3b82f6);">${Icons.sparkles}</div>
                                    <div class="ia-chat-bubble">
                                        <strong>Assistente SocialFlow</strong><br>
                                        Olá! 👋 Sou seu assistente de criação de conteúdo. Me diga o que você precisa:<br><br>
                                        • Criar uma <strong>copy</strong> para Instagram, LinkedIn, TikTok...<br>
                                        • <strong>Ideias</strong> de conteúdo para um cliente<br>
                                        • <strong>Reformular</strong> um texto existente<br>
                                        • Qualquer dúvida sobre <strong>Social Media</strong> 🚀
                                    </div>
                                </div>
                            </div>
                            <!-- Chat Input -->
                            <div style="padding:20px; border-top:1px solid var(--gray-100); background:var(--white); display:flex; gap:12px; align-items:center;">
                                <textarea id="ia-chat-input" rows="1" placeholder="Como posso te ajudar hoje?" 
                                    style="flex:1; resize:none; border:none; border-radius:var(--radius-lg); padding:14px 18px; font-family:inherit; font-size:14px; line-height:1.5; max-height:100px; outline:none; transition:all 0.3s cubic-bezier(0.4, 0, 0.2, 1); background:var(--gray-25);"
                                    onkeydown="if(event.key==='Enter' && !event.shiftKey){event.preventDefault(); enviarMsgChat()}"
                                    onfocus="this.style.borderColor='var(--primary)'; this.style.background='var(--white)'; this.style.boxShadow='0 0 0 4px var(--primary-50)'" 
                                    onblur="this.style.borderColor='var(--gray-200)'; this.style.background='var(--gray-25)'; this.style.boxShadow='none'"
                                ></textarea>
                                <button class="btn btn-primary" onclick="enviarMsgChat()" style="height:48px; width:48px; padding:0; border-radius:var(--radius-full); flex-shrink:0;">
                                    ${Icons.send || `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>`}
                                </button>
                            </div>
                        </div>
                    </div>
                    ` : ''}


                    <!-- Retornos de Clientes (Notificações) -->
                    ${user.role === 'social_media' || user.role === 'admin' || user.role === 'master' ? `
                    <div class="animate-fade-in" style="animation-delay: 0.15s; margin-top:var(--space-6); margin-bottom:var(--space-6);">
                        <h2 class="dashboard-section-title" style="color:var(--primary-dark);">
                            ${Icons.messageCircle || '💬'} Retornos de Clientes
                            ${Store.getNotificacoesNaoLidas().length > 0 ? `<span class="badge badge-warning" style="margin-left:8px;">${Store.getNotificacoesNaoLidas().length} novos</span>` : ''}
                        </h2>
                        <div class="card card-body">
                            ${Store.getNotificacoes().length > 0 ? `
                                <div style="display:flex; flex-direction:column; gap:var(--space-3);">
                                    ${Store.getNotificacoes().slice(0, 5).map(n => {
                                        const c = Store.getCronogramaById(n.conteudoId);
                                        const iconMap = {
                                            'aprovacao': '✅',
                                            'observacao': '📝',
                                            'reprovacao': '❌'
                                        };
                                        return `
                                            <div style="background:${n.lida ? 'var(--gray-50)' : 'var(--warning-light)'}; border-left:3px solid ${n.tipo === 'reprovacao' ? 'var(--danger)' : (n.tipo === 'observacao' ? 'var(--warning)' : 'var(--success)')}; padding:var(--space-3); border-radius:4px; display:flex; gap:var(--space-3); align-items:flex-start;">
                                                <div style="font-size:20px;">${iconMap[n.tipo] || '💬'}</div>
                                                <div style="flex:1;">
                                                    <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
                                                        <strong style="font-size:var(--font-sm); color:var(--gray-900);">${n.titulo}</strong>
                                                        <span style="font-size:10px; color:var(--gray-500);">${formatDateRelative(n.criadoEm)}</span>
                                                    </div>
                                                    <p style="font-size:var(--font-sm); color:var(--gray-700); white-space:pre-wrap;">${n.mensagem}</p>
                                                    ${!n.lida ? `
                                                        <button class="btn btn-ghost btn-sm" onclick="Store.marcarNotificacaoLida('${n.id}'); App.render()" style="margin-top:var(--space-2); font-size:11px; padding:4px 8px;">
                                                            Marcar como visto
                                                        </button>
                                                    ` : ''}
                                                </div>
                                            </div>
                                        `;
                                    }).join('')}
                                </div>
                            ` : `<p style="text-align:center; color:var(--gray-400); padding:var(--space-4);">Nenhum retorno de cliente recente.</p>`}
                        </div>
                    </div>
                    ` : ''}

                    <!-- Últimas atividades -->
                    <div class="animate-fade-in" style="animation-delay: 0.2s;">
                        <h2 class="dashboard-section-title">
                            ${Icons.clock}
                            Atividades Recentes
                        </h2>
                        <div class="card card-body">
                            ${ultimasAtividades.length > 0 ? `
                                <div class="timeline">
                                    ${ultimasAtividades.map(a => {
                                        const u = Store.getUserById(a.userId);
                                        return `
                                            <div class="timeline-item">
                                                <div class="timeline-dot dot-${a.tipo}"></div>
                                                <div class="timeline-content">
                                                    <strong>${a.acao}</strong>
                                                    <div style="font-size:var(--font-xs); color:var(--gray-500); margin-top:2px;">
                                                        ${a.cronogramaTitulo} · ${u ? u.nome : ''}
                                                    </div>
                                                    <div class="timeline-time">${formatDateRelative(a.data)}</div>
                                                </div>
                                            </div>
                                        `;
                                    }).join('')}
                                </div>
                            ` : `
                                <p style="text-align:center; color:var(--gray-400); padding:var(--space-6);">Nenhuma atividade recente</p>
                            `}
                        </div>
                    </div>
                </div>
            </div>
        </main>
    `;
}
function renderCronogramaCard(c) {
    const criador = Store.getUserById(c.criadoPor);
    const conta = Store.getContaById(c.contaId);
    const progress = calcProgress(c);

    return `
        <div class="card cronograma-card card-interactive animate-fade-in" onclick="Store.navigate('cronograma-detalhes', { cronogramaId: '${c.id}' })" style="padding:20px; border-left:4px solid ${getStatusColor(c.status)}; display:flex; align-items:center; gap:20px; margin-bottom:12px;">
            <div class="cronograma-info" style="flex:1;">
                ${!Store.getContaAtiva() && conta ? `
                    <div style="font-size:10px; font-weight:800; color:${conta.cor}; text-transform:uppercase; margin-bottom:4px; letter-spacing:0.05em;">${conta.nome}</div>
                ` : ''}
                <div style="font-size:16px; font-weight:700; color:var(--gray-900);">${c.titulo || 'Sem título'}</div>
                <div class="cronograma-meta" style="margin-top:6px; display:flex; gap:16px; font-size:12px; color:var(--gray-500); font-weight:500;">
                    <span style="display:flex; align-items:center; gap:4px; color:var(--primary); font-weight:700;">
                        ${Icons.calendar} ${c.dataInicio ? formatDate(c.dataInicio) : (c.previsaoPostagem ? formatDate(c.previsaoPostagem) : 'Sem data')}
                    </span>
                    <span style="display:flex; align-items:center; gap:4px;">${Icons.layout} ${(c.posts || []).length} posts</span>
                </div>
            </div>
            <div style="text-align:right; min-width:140px;">
                ${renderStatusBadge(c.status)}
                <div style="margin-top:12px;">
                    ${renderProgressBar(progress)}
                </div>
            </div>
        </div>
    `;
}

function getStatusColor(status) {
    const colors = {
        rascunho: 'var(--gray-300)',
        aguardando_aprovacao_conteudo: 'var(--warning)',
        revisao_conteudo: 'var(--danger)',
        em_producao: 'var(--info)',
        aguardando_aprovacao_artes: 'var(--warning)',
        revisao_artes: 'var(--danger)',
        aprovado: 'var(--success)',
        agendado: 'var(--info)',
        concluido: 'var(--success)'
    };
    return colors[status] || 'var(--gray-300)';
}

function getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return '☀️ Bom dia!';
    if (hour < 18) return '🌤️ Boa tarde!';
    return '🌙 Boa noite!';
}

function renderDashboardTimelineStats(cronogramas) {
    let counts = {
        rascunho: 0,
        aguardando_aprovacao_conteudo: 0,
        em_producao: 0,
        aguardando_aprovacao_artes: 0,
        aprovado: 0,
        agendado: 0,
        concluido: 0
    };
    
    cronogramas.forEach(c => {
        if (c.status === 'revisao_conteudo') counts.aguardando_aprovacao_conteudo++;
        else if (c.status === 'revisao_artes') counts.aguardando_aprovacao_artes++;
        else if (counts[c.status] !== undefined) counts[c.status]++;
    });

    // Agrupar Design e Artes
    counts.criacao_artes = counts.em_producao + counts.aguardando_aprovacao_artes;

    const steps = [
        { id: 'rascunho', label: 'Backlog', icon: Icons.fileText, color: 'var(--gray-500)', bg: 'var(--gray-50)' },
        { id: 'aguardando_aprovacao_conteudo', label: 'Textos', icon: Icons.edit, color: 'var(--warning-dark)', bg: 'var(--warning-light)' },
        { id: 'criacao_artes', label: 'Criação de Artes', icon: Icons.palette, color: 'var(--info-dark)', bg: 'var(--info-light)' },
        { id: 'aprovado', label: 'Aprovadas', icon: Icons.checkCircle, color: 'var(--success-dark)', bg: 'var(--success-light)' },
        { id: 'agendado', label: 'Agendadas', icon: Icons.calendar, color: '#4F46E5', bg: '#EEF2FF' },
        { id: 'concluido', label: 'Concluídas', icon: Icons.check, color: 'var(--success-dark)', bg: 'var(--success-light)' }
    ];

    let html = '<div class="animate-fade-in" style="margin-bottom:32px; display:grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap:16px;">';
    
    steps.forEach((s) => {
        const count = counts[s.id];
        const isActive = count > 0;
        
        html += `
            <div class="card" style="padding:24px; background:${isActive ? 'white' : 'var(--gray-50)'}; display:flex; flex-direction:column; gap:20px; transition:all var(--transition-base); border-color:${isActive ? 'var(--gray-100)' : 'transparent'}; box-shadow:${isActive ? 'var(--shadow-sm)' : 'none'};">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <div style="width:48px; height:48px; border-radius:14px; background:${isActive ? s.bg : 'var(--gray-100)'}; color:${isActive ? s.color : 'var(--gray-400)'}; display:flex; align-items:center; justify-content:center; font-size:24px; box-shadow:${isActive ? '0 8px 16px -4px ' + s.color + '30' : 'none'};">
                        ${s.icon}
                    </div>
                </div>
                <div>
                    <div style="font-size:28px; font-weight:800; color:${isActive ? 'var(--gray-900)' : 'var(--gray-400)'}; letter-spacing:-0.03em;">${count}</div>
                    <div style="font-size:12px; font-weight:700; color:${isActive ? 'var(--gray-600)' : 'var(--gray-400)'}; text-transform:uppercase; letter-spacing:0.05em; margin-top:2px;">${s.label}</div>
                </div>
            </div>
        `;
    });

    html += '</div>';
    return html;
}

window.dashMesAnterior = function() {
    window.dashMesAtual--;
    if (window.dashMesAtual < 0) {
        window.dashMesAtual = 11;
        window.dashAnoAtual--;
    }
    App.render();
};

window.dashMesProximo = function() {
    window.dashMesAtual++;
    if (window.dashMesAtual > 11) {
        window.dashMesAtual = 0;
        window.dashAnoAtual++;
    }
    App.render();
};

// ====================================
// VISÃO DO CLIENTE
// ====================================

function renderDashboardCliente() {
    const user = Store.getState().currentUser;
    const contaAtiva = Store.getContaAtiva();
    const cronogramas = Store.getCronogramas();

    const pendentesConteudo = cronogramas.filter(c => c.status === 'aguardando_aprovacao_conteudo');
    const pendentesArtes = cronogramas.filter(c => c.status === 'aguardando_aprovacao_artes');

    const renderCardPendencia = (c, tipoAprovacao) => {
        const itens = tipoAprovacao === 'conteudo' ? c.copys : c.artes;
        
        return `
        <div class="card animate-fade-in" style="padding:24px; margin-bottom:24px; border:1px solid var(--gray-100); box-shadow:var(--shadow-sm); border-left:4px solid ${tipoAprovacao === 'conteudo' ? 'var(--warning)' : 'var(--primary)'};">
            <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:20px;">
                <div>
                    <h3 style="font-size:18px; font-weight:800; color:var(--gray-900); letter-spacing:-0.02em;">${c.titulo}</h3>
                    <div style="font-size:12px; color:var(--gray-500); margin-top:4px; font-weight:500;">
                        ${Icons.calendar} Expira em: ${formatDate(c.dataFim)}
                    </div>
                </div>
                ${renderStatusBadge(c.status)}
            </div>

            <div style="display:flex; flex-direction:column; gap:16px;">
                ${itens.map(it => `
                    <div style="background:var(--gray-25); border:1px solid var(--gray-50); border-radius:12px; padding:16px;">
                        <div style="display:flex; justify-content:space-between; align-items:center;">
                            <div style="font-weight:700; font-size:14px; color:var(--gray-900);">${it.titulo || it.nome}</div>
                            <div style="display:flex; gap:10px;">
                                ${it.status === 'aprovado' ? `
                                    <span style="display:flex; align-items:center; gap:4px; color:var(--success); font-weight:800; font-size:11px; text-transform:uppercase;">
                                        ${Icons.check} Aprovado
                                    </span>
                                ` : `
                                    <button class="btn btn-ghost btn-xs" onclick="abrirModalFeedbackGranular('${c.id}', '${it.id}', '${tipoAprovacao === 'conteudo' ? 'copy' : 'arte'}')" style="color:var(--danger); border:1px solid var(--danger-50); background:var(--danger-25);">
                                        Revisar
                                    </button>
                                    <button class="btn btn-success btn-xs" onclick="Store.mudarStatusItem('${c.id}', '${it.id}', '${tipoAprovacao === 'conteudo' ? 'copy' : 'arte'}', 'aprovado')" style="font-weight:700;">
                                        Aprovar
                                    </button>
                                `}
                            </div>
                        </div>
                        ${tipoAprovacao === 'conteudo' ? `
                            <div style="font-size:14px; color:var(--gray-700); margin-top:10px; line-height:1.6; white-space:pre-wrap;">${it.texto}</div>
                        ` : `
                            <div style="margin-top:12px; width:100%; aspect-ratio:1.91; background:var(--gray-50); border-radius:8px; overflow:hidden; border:none;">
                                ${it.preview ? `<img src="${it.preview}" style="width:100%; height:100%; object-fit:cover;">` : `<div style="display:flex; align-items:center; justify-content:center; height:100%; color:var(--gray-300);">${Icons.image}</div>`}
                            </div>
                        `}
                        ${it.feedback ? `<div style="margin-top:10px; font-size:12px; color:var(--danger); font-weight:600; padding:8px; background:var(--danger-25); border-radius:6px; border-left:3px solid var(--danger);">"${it.feedback}"</div>` : ''}
                    </div>
                `).join('')}
            </div>

            <div style="margin-top:24px;">
                <button class="btn btn-ghost btn-sm" onclick="Store.navigate('cronograma-detalhes', { cronogramaId: '${c.id}' })" style="width:100%; color:var(--gray-500); border:1px dashed var(--gray-200);">
                    ${Icons.eye} Abrir painel completo de comentários
                </button>
            </div>
        </div>
        `;
    };

    return `
        ${renderSidebar('dashboard')}
        <main class="main-content">
            <div class="page-header">
                <div>
                    <h1 style="font-size:24px; font-weight:800; color:var(--gray-900); letter-spacing:-0.03em;">Seus Conteúdos</h1>
                    <p style="font-size:14px; color:var(--gray-500); font-weight:500; margin-top:4px;">Bem-vindo(a), ${user.nome}! ${getGreeting()} ${contaAtiva ? `· <span style="color:var(--primary); font-weight:700;">${contaAtiva.nome}</span>` : ''}</p>
                </div>
            </div>

            <div class="page-body">
                ${renderClientOnboarding()}
                <div class="dashboard-cliente-layout">
                    <!-- Coluna Principal: Conteúdos Pendentes -->
                    <div class="cliente-main-col animate-fade-in">

                        ${pendentesConteudo.length === 0 && pendentesArtes.length === 0 ? `
                            <div class="card empty-state" style="margin-bottom:var(--space-8);">
                                ${Icons.checkCircle}
                                <h3>Você está em dia!</h3>
                                <p>Não há textos ou artes aguardando sua aprovação no momento.</p>
                            </div>
                        ` : ''}

                        ${pendentesConteudo.length > 0 ? `
                            <h2 class="dashboard-section-title" style="color:var(--warning-dark); margin-bottom:var(--space-4);">
                                ${Icons.clock} Aprovar Planejamento / Textos (${pendentesConteudo.length})
                            </h2>
                            <div style="display:flex; flex-direction:column; gap:var(--space-4);">
                                ${pendentesConteudo.map(c => renderCardPendencia(c, 'conteudo')).join('')}
                            </div>
                        ` : ''}

                        ${pendentesArtes.length > 0 ? `
                            <h2 class="dashboard-section-title" style="color:var(--info-dark); margin-bottom:var(--space-4); margin-top:var(--space-6);">
                                ${Icons.image} Aprovar Artes Finais (${pendentesArtes.length})
                            </h2>
                            <div style="display:flex; flex-direction:column; gap:var(--space-4);">
                                ${pendentesArtes.map(c => renderCardPendencia(c, 'artes')).join('')}
                            </div>
                        ` : ''}
                    </div>

                    <!-- Coluna Lateral: Mini Calendário -->
                    <div class="cliente-side-col animate-fade-in" style="animation-delay:0.2s;">
                        <div class="card card-body" style="position:sticky; top:var(--space-6);">
                            <h3 style="font-size:var(--font-base); font-weight:700; color:var(--gray-800); margin-bottom:var(--space-4); display:flex; align-items:center; gap:var(--space-2);">
                                ${Icons.grid} Visão Mensal
                            </h3>
                            ${renderMiniCalendario(cronogramas)}
                        </div>
                    </div>
                </div>
            </div>
        </main>
    `;
}

function renderMiniCalendario(cronogramas) {
    const hoje = new Date();
    const mesAtual = hoje.getMonth();
    const anoAtual = hoje.getFullYear();

    const diasNoMes = new Date(anoAtual, mesAtual + 1, 0).getDate();
    const primeiroDia = new Date(anoAtual, mesAtual, 1).getDay();

    // Mapear cronogramas nos dias
    const diasMap = {};
    for (let d = 1; d <= diasNoMes; d++) {
        diasMap[d] = [];
    }

    cronogramas.forEach(c => {
        const inicio = new Date(c.dataInicio);
        const fim = new Date(c.dataFim);

        for (let d = 1; d <= diasNoMes; d++) {
            const dia = new Date(anoAtual, mesAtual, d);
            if (dia >= inicio && dia <= fim) {
                diasMap[d].push(c);
            }
        }
    });

    const diasSemana = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

    return `
        <div class="mini-cal">
            <div style="text-align:center; font-weight:700; margin-bottom:var(--space-3); color:var(--gray-800);">
                ${MESES_LABELS[mesAtual]} ${anoAtual}
            </div>
            <div class="mini-cal-grid">
                ${diasSemana.map(d => `<div class="mini-cal-header">${d}</div>`).join('')}
                ${Array(primeiroDia).fill('').map(() => `<div class="mini-cal-cell empty"></div>`).join('')}
                ${Array.from({ length: diasNoMes }, (_, i) => i + 1).map(d => {
                    const items = diasMap[d];
                    const isToday = d === hoje.getDate();
                    let corDestaque = '';
                    
                    if (items.length > 0) {
                        // Pegar a cor do status mais crítico (ex: aguardando_aprovacao = warning)
                        const hasPendente = items.some(c => c.status === 'aguardando_aprovacao_conteudo' || c.status === 'aguardando_aprovacao_artes');
                        const hasAprovado = items.some(c => c.status === 'aprovado');
                        if (hasPendente) corDestaque = 'var(--warning)';
                        else if (hasAprovado) corDestaque = 'var(--success)';
                        else corDestaque = 'var(--info)';
                    }

                    return `
                        <div class="mini-cal-cell ${isToday ? 'today' : ''}" ${corDestaque ? `style="border-bottom:3px solid ${corDestaque};"` : ''}>
                            ${d}
                        </div>
                    `;
                }).join('')}
            </div>
            
            <div style="margin-top:var(--space-4); display:flex; flex-direction:column; gap:var(--space-2); font-size:var(--font-xs); color:var(--gray-500);">
                <div style="display:flex; align-items:center; gap:var(--space-2);">
                    <div style="width:8px; height:8px; border-radius:50%; background:var(--warning);"></div>
                    Aguardando sua aprovação
                </div>
                <div style="display:flex; align-items:center; gap:var(--space-2);">
                    <div style="width:8px; height:8px; border-radius:50%; background:var(--success);"></div>
                    Aprovados
                </div>
        </div>
    `;
}

// ====================================
// AÇÕES DO CLIENTE NO DASHBOARD — Removido (Moveram-se para common.js)
// ====================================


// ====================================
// VISÃO DO DESIGNER
// ====================================

function renderDashboardDesigner() {
    const user = Store.getState().currentUser;
    const cronogramas = Store.getCronogramas();

    const novas = cronogramas.filter(c => c.status === 'em_producao' && c.artes.length === 0);
    const emAndamento = cronogramas.filter(c => c.status === 'em_producao' && c.artes.length > 0);
    const aguardando = cronogramas.filter(c => c.status === 'aguardando_aprovacao_artes' || c.status === 'revisao_artes');
    
    // Contador Mensal
    const mesAtual = new Date().toISOString().substring(0, 7);
    const entreguesNoMes = cronogramas.filter(c => 
        ['aguardando_aprovacao_artes', 'aprovado', 'agendado', 'concluido'].includes(c.status) && 
        c.timeline.some(t => t.userId === user.id && t.acao.includes('Arte') && t.data.startsWith(mesAtual))
    ).length;

    // Últimos comentários de arte
    const feedbacks = Store.getNotificacoes().filter(n => n.paraRole === 'designer' && n.tipo !== 'aprovacao').slice(0, 3);

    return `
        ${renderSidebar('dashboard')}
        <main class="main-content">
            <div class="page-header">
                <div>
                    <h1 style="font-size:24px; font-weight:800; color:var(--gray-900); letter-spacing:-0.03em;">Central Criativa</h1>
                    <p style="font-size:14px; color:var(--gray-500); font-weight:500; margin-top:4px;">Olá, ${user.nome}! Vamos criar algo incrível hoje? 🎨</p>
                </div>
                <div class="card" style="padding:16px 24px; background:var(--gray-900); color:white; border:none; display:flex; align-items:center; gap:20px; box-shadow:0 10px 20px -5px rgba(0,0,0,0.2);">
                    <div style="font-size:32px; font-weight:800; color:var(--primary); line-height:1;">${entreguesNoMes}</div>
                    <div style="font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.05em; color:var(--gray-400); line-height:1.3;">Criativos Entregues<br>no último período</div>
                </div>
            </div>

            <div class="page-body">
                <div class="designer-kanban-grid" style="display:grid; grid-template-columns:repeat(2, 1fr); gap:var(--space-8); align-items:flex-start;">
                    
                    <!-- NOVAS DEMANDAS -->
                    <div class="kanban-col">
                        <div style="background:var(--gray-900); padding:24px; border-radius:16px; margin-bottom:var(--space-4); color:white; box-shadow:var(--shadow-lg);">
                            <h2 style="font-size:18px; font-weight:800; display:flex; align-items:center; gap:10px; margin:0;">
                                ${Icons.inbox} Backlog de Criação
                                <span style="background:var(--primary); font-size:10px; padding:2px 10px; border-radius:20px;">${novas.length}</span>
                            </h2>
                            <p style="font-size:11px; color:var(--gray-400); margin-top:6px; font-weight:500; text-transform:uppercase; letter-spacing:0.05em;">Novos briefings aguardando design</p>
                        </div>
                        ${novas.map(c => renderDesignerTaskCard(c, 'nova')).join('')}
                    </div>

                    <!-- EM PRODUÇÃO / EM REVISÃO -->
                    <div class="kanban-col">
                         <div style="background:var(--white); padding:24px; border-radius:16px; margin-bottom:var(--space-4); box-shadow:var(--shadow-sm);">
                            <h2 style="font-size:18px; font-weight:800; color:var(--gray-900); display:flex; align-items:center; gap:10px; margin:0;">
                                ${Icons.clock} Fila de Entrega
                                <span style="background:var(--warning); color:var(--warning-dark); font-size:10px; padding:2px 10px; border-radius:20px;">${emAndamento.length + aguardando.length}</span>
                            </h2>
                            <p style="font-size:11px; color:var(--gray-500); margin-top:6px; font-weight:500; text-transform:uppercase; letter-spacing:0.05em;">Artes em criação ou com ajustes solicitados</p>
                        </div>
                        ${emAndamento.map(c => renderDesignerTaskCard(c, 'andamento')).join('')}
                        ${aguardando.map(c => renderDesignerTaskCard(c, 'retorno')).join('')}
                    </div>
                </div>

                <!-- FEEDBACK RECENTE -->
                <div style="margin-top:var(--space-8);">
                    <h2 class="dashboard-section-title">${Icons.star} Últimos Feedbacks dos Clientes</h2>
                    <div class="card card-body" style="background:var(--gray-50); border:1px dashed var(--gray-300);">
                        ${feedbacks.length > 0 ? feedbacks.map(f => `
                            <div style="display:flex; gap:12px; margin-bottom:12px; padding-bottom:12px; border-bottom:1px solid var(--gray-200);">
                                <div style="font-size:20px;">💬</div>
                                <div>
                                    <div style="font-weight:700; font-size:13px; color:var(--gray-800);">${f.titulo}</div>
                                    <p style="font-size:12px; color:var(--gray-600); margin:4px 0;">"${f.mensagem}"</p>
                                    <div style="font-size:10px; color:var(--gray-400);">${formatDateRelative(f.criadoEm)}</div>
                                </div>
                            </div>
                        `).join('') : '<p style="text-align:center; color:var(--gray-400); font-size:12px;">Nenhum feedback nas últimas demandas.</p>'}
                    </div>
                </div>
            </div>
        </main>
    `;
}

function renderDesignerTaskCard(c, tipo) {
    const conta = Store.getContaById(c.contaId);
    return `
        <div class="card card-body card-interactive animate-fade-in" 
            onclick="Store.navigate('cronograma-detalhes', { cronogramaId: '${c.id}' })"
            style="margin-bottom:16px; border-top:3px solid ${conta?.cor || 'var(--gray-200)'};">
            <div style="font-size:10px; font-weight:800; color:${conta?.cor}; text-transform:uppercase; margin-bottom:4px;">${conta?.nome}</div>
            <h3 style="font-size:14px; font-weight:700; color:var(--gray-900); margin-bottom:12px;">${c.titulo}</h3>
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <div style="display:flex; align-items:center; gap:8px;">
                    <span style="font-size:11px; color:var(--gray-500); display:flex; align-items:center; gap:4px;">
                        ${Icons.image} ${c.artes.length}
                    </span>
                    <span style="font-size:11px; color:var(--danger); font-weight:700;">
                         ${formatDateRelative(c.dataFim)}
                    </span>
                </div>
                ${tipo === 'nova' ? `<div style="width:8px; height:8px; border-radius:50%; background:var(--primary); animation:pulse 2s infinite;"></div>` : ''}
            </div>
        </div>
    `;
}

// ====================================
// VISÃO MASTER: LIDERANÇA (ADMIN) E MÓDULO IA
// ====================================

function renderDashboardAdmin() {
    const user = Store.getState().currentUser;
    const contas = Store.getContas();
    const cronogramas = Store.getCronogramas();

    if (typeof window.dashMesAtual === 'undefined') {
        window.dashMesAtual = new Date().getMonth();
        window.dashAnoAtual = new Date().getFullYear();
    }

    // Timeline global
    const cronogramasMes = cronogramas.filter(c => {
        const d = new Date(c.dataInicio);
        return d.getMonth() === window.dashMesAtual && d.getFullYear() === window.dashAnoAtual;
    });

    // Atividades recentes globais
    const todasAtividades = [];
    cronogramas.forEach(c => {
        c.timeline.forEach(t => {
            todasAtividades.push({ ...t, cronogramaTitulo: c.titulo, cronogramaId: c.id });
        });
    });
    todasAtividades.sort((a, b) => new Date(b.data) - new Date(a.data));
    const ultimasAtividades = todasAtividades.slice(0, 8);

    // Próximos global
    const proximos = cronogramas
        .filter(c => c.status !== 'concluido' && c.status !== 'agendado')
        .sort((a, b) => new Date(a.dataInicio) - new Date(b.dataInicio))
        .slice(0, 5);

    return `
        ${renderSidebar('dashboard')}
        <main class="main-content">
            <div class="page-header">
                <div>
                    <h1>Visão Master: Liderança</h1>
                    <p class="page-header-subtitle">Bem-vindo(a), ${user.nome}! Controle macro de todos os clientes da agência.</p>
                </div>
            </div>

            <div class="page-body">
                <!-- MÓDULO DE IA: BOLETIM DIÁRIO -->
                <section style="margin-bottom:var(--space-8);">
                    ${renderAdminAIBrief(contas, cronogramas)}
                </section>

                <!-- GRID DE CLIENTES (CONTAS) -->
                <h2 class="dashboard-section-title">${Icons.grid} Painel de Clientes (Contas)</h2>
                <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(300px, 1fr)); gap:var(--space-4); margin-bottom:var(--space-8);">
                    ${contas.map(conta => {
                        const cronosConta = cronogramas.filter(c => c.contaId === conta.id);
                        const ativos = cronosConta.filter(c => c.status !== 'concluido' && c.status !== 'agendado');
                        const pendentesAgCliente = ativos.filter(c => c.status === 'aguardando_aprovacao_conteudo' || c.status === 'aguardando_aprovacao_artes');
                        const hoje = new Date(); hoje.setHours(0,0,0,0);
                        const atrasados = ativos.filter(c => new Date(c.dataInicio) < hoje);

                        let statusColor = 'var(--success)';
                        if (atrasados.length > 0) statusColor = 'var(--danger)';
                        else if (pendentesAgCliente.length > 0) statusColor = 'var(--warning)';
                        else if (ativos.length === 0) statusColor = 'var(--gray-300)';

                        return `
                            <div class="card card-interactive" onclick="window.acessarDetalheCliente('${conta.id}')" style="border-top:4px solid ${statusColor};">
                                <h3 style="font-size:var(--font-lg); font-weight:800; color:var(--gray-900); margin-bottom:var(--space-3);">${conta.nome}</h3>
                                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:var(--space-2);">
                                    <span style="font-size:var(--font-sm); color:var(--gray-600);">Conteúdos Ativos</span>
                                    <strong style="font-size:var(--font-lg); color:var(--gray-800);">${ativos.length}</strong>
                                </div>
                                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:var(--space-2);">
                                    <span style="font-size:var(--font-sm); color:var(--warning-dark);">Aguardando Cliente</span>
                                    <strong style="font-size:var(--font-base); color:var(--warning-dark);">${pendentesAgCliente.length}</strong>
                                </div>
                                <div style="display:flex; justify-content:space-between; align-items:center;">
                                    <span style="font-size:var(--font-sm); color:var(--danger-dark);">Atrasados</span>
                                    <strong style="font-size:var(--font-base); color:var(--danger-dark);">${atrasados.length}</strong>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>

                <hr style="border:0; border-top:1px dashed var(--gray-300); margin:var(--space-8) 0;">

                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:var(--space-4);">
                    <h2 class="dashboard-section-title" style="margin:0;">
                        ${Icons.barChart} Fluxo de Produção Global (Todas as Contas)
                    </h2>
                    <div style="display:flex; align-items:center; gap:var(--space-2); background:var(--white); padding:4px 8px; border-radius:var(--radius-md); border:1px solid var(--gray-200);">
                        <button class="btn btn-ghost btn-sm" onclick="dashMesAnterior()" style="padding:4px;">${Icons.chevronLeft}</button>
                        <div style="font-weight:600; font-size:13px; min-width:100px; text-align:center;">${MESES_LABELS[window.dashMesAtual]} ${window.dashAnoAtual}</div>
                        <button class="btn btn-ghost btn-sm" onclick="dashMesProximo()" style="padding:4px;">${Icons.chevronRight}</button>
                    </div>
                </div>

                <!-- Stats Timeline Global -->
                ${renderDashboardTimelineStats(cronogramasMes)}

                <!-- Grid principal Global -->
                <div class="dashboard-grid">
                    <!-- Próximos cronogramas globais -->
                    <div class="animate-fade-in" style="animation-delay: 0.1s;">
                        <h2 class="dashboard-section-title">
                            ${Icons.calendar}
                            Conteúdos Ativos (Todas as Contas)
                        </h2>
                        <div class="cronogramas-grid">
                            ${proximos.length > 0 ? proximos.map(c => renderCronogramaCard(c)).join('') : `
                                <div class="card">
                                    <div class="empty-state" style="padding: var(--space-8);">
                                        ${Icons.calendar}
                                        <h3>Nenhum conteúdo ativo na agência</h3>
                                    </div>
                                </div>
                            `}
                        </div>
                    </div>

                    <!-- Últimas atividades -->
                    <div class="animate-fade-in" style="animation-delay: 0.2s;">
                        <h2 class="dashboard-section-title">
                            ${Icons.clock}
                            Atividades Recentes (Todas as Contas)
                        </h2>
                        <div class="card card-body">
                            ${ultimasAtividades.length > 0 ? `
                                <div class="timeline">
                                    ${ultimasAtividades.map(a => {
                                        const u = Store.getUserById(a.userId);
                                        return `
                                            <div class="timeline-item">
                                                <div class="timeline-dot dot-${a.tipo}"></div>
                                                <div class="timeline-content">
                                                    <strong>${a.acao}</strong>
                                                    <div style="font-size:var(--font-xs); color:var(--gray-500); margin-top:2px;">
                                                        ${a.cronogramaTitulo} · ${u ? u.nome : ''}
                                                    </div>
                                                    <div class="timeline-time">${formatDateRelative(a.data)}</div>
                                                </div>
                                            </div>
                                        `;
                                    }).join('')}
                                </div>
                            ` : `
                                <p style="text-align:center; color:var(--gray-400); padding:var(--space-6);">Nenhuma atividade recente</p>
                            `}
                        </div>
                    </div>
                </div>

            </div>
        </main>
    `;
}

// Removido acessarDetalheCliente / voltarParaMaster

// renderAdminAIBrief removido daqui e movido para lideranca.js

function renderClientOnboarding() {
    const closed = localStorage.getItem('socialflow_onboarding_closed');
    if (closed) return '';

    return `
        <div id="onboarding-card" class="card" style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); color: white; border: none; margin-bottom: var(--space-6); position: relative; overflow: hidden; animation: slideDown 0.5s ease both;">
            <div style="position: absolute; top: -20px; right: -20px; width: 120px; height: 120px; background: rgba(255,255,255,0.1); border-radius: 50%;"></div>
            <div style="padding: var(--space-6); position: relative; z-index: 2;">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: var(--space-4);">
                    <div style="display: flex; gap: var(--space-3); align-items: center;">
                        <div style="width: 40px; height: 40px; background: rgba(255,255,255,0.2); border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 20px;">
                            🚀
                        </div>
                        <h2 style="font-size: var(--font-xl); font-weight: 800;">Novo no SocialFlow?</h2>
                    </div>
                    <button onclick="fecharOnboarding()" style="background: none; border: none; color: white; opacity: 0.6; cursor: pointer; padding: 4px;">
                        ${Icons.x}
                    </button>
                </div>
                
                <p style="font-size: var(--font-sm); opacity: 0.9; max-width: 600px; margin-bottom: var(--space-6);">
                    Entenda como funciona o fluxo de aprovação dos seus materiais de Social Media:
                </p>

                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: var(--space-4);">
                    <div style="background: rgba(255,255,255,0.1); padding: var(--space-4); border-radius: var(--radius-lg); border: 1px solid rgba(255,255,255,0.1);">
                        <div style="font-size: 10px; font-weight: 800; text-transform: uppercase; margin-bottom: 8px; opacity: 0.7;">PASSO 1</div>
                        <h4 style="margin-bottom: 4px;">📝 Aprovação de Textos</h4>
                        <p style="font-size: 12px; opacity: 0.8; line-height: 1.5;">Começamos aprovando as legendas. Você pode aprovar direto, aprovar com observações ou solicitar ajustes.</p>
                    </div>
                    <div style="background: rgba(255,255,255,0.1); padding: var(--space-4); border-radius: var(--radius-lg); border: 1px solid rgba(255,255,255,0.1);">
                        <div style="font-size: 10px; font-weight: 800; text-transform: uppercase; margin-bottom: 8px; opacity: 0.7;">PASSO 2</div>
                        <h4 style="margin-bottom: 4px;">🎨 Aprovação de Artes</h4>
                        <p style="font-size: 12px; opacity: 0.8; line-height: 1.5;">Com o texto OK, nosso time cria as artes. Você recebe e dá o "aceite" visual final aqui na plataforma.</p>
                    </div>
                    <div style="background: rgba(255,255,255,0.1); padding: var(--space-4); border-radius: var(--radius-lg); border: 1px solid rgba(255,255,255,0.1);">
                        <div style="font-size: 10px; font-weight: 800; text-transform: uppercase; margin-bottom: 8px; opacity: 0.7;">PASSO 3</div>
                        <h4 style="margin-bottom: 4px;">🗓️ Agendamento</h4>
                        <p style="font-size: 12px; opacity: 0.8; line-height: 1.5;">Tudo aprovado? Nós cuidamos do agendamento oficial e os posts entram no seu calendário.</p>
                    </div>
                </div>
            </div>
        </div>
    `;
}

window.fecharOnboarding = function() {
    localStorage.setItem('socialflow_onboarding_closed', 'true');
    const el = document.getElementById('onboarding-card');
    if (el) el.style.opacity = '0';
    setTimeout(() => {
        if (window.PortalCliente) {
            PortalCliente.render();
        } else if (window.App) {
            App.render();
        }
    }, 300);
};

window.gerarConteudoIA = async function() {
    const tema = document.getElementById('ia-tema')?.value.trim();
    const rede = document.getElementById('ia-rede')?.value || 'instagram';
    const tom = document.getElementById('ia-tom')?.value || 'descontraido';

    if (!tema) {
        showToast('Informe o tema ou assunto para gerar o conteúdo.', 'warning');
        return;
    }

    const loading = document.getElementById('ia-loading');
    const resultado = document.getElementById('ia-resultado');
    const texto = document.getElementById('ia-resultado-texto');
    
    if (loading) loading.style.display = 'block';
    if (resultado) resultado.style.display = 'none';

    try {
        const copy = await AIService.gerarConteudo(tema, rede, tom);
        if (texto) {
            texto.textContent = copy.replace(/\*\*(.*?)\*\*/g, '$1');
        }
        if (loading) loading.style.display = 'none';
        if (resultado) resultado.style.display = 'block';
    } catch (error) {
        if (loading) loading.style.display = 'none';
        showToast('Erro ao gerar conteúdo: ' + error.message, 'danger');
    }
};

window.copiarCopyIA = function() {
    const texto = document.getElementById('ia-resultado-texto');
    if (texto) {
        navigator.clipboard.writeText(texto.textContent).then(() => {
            showToast('Copy copiada para a área de transferência!', 'success');
        }).catch(() => {
            // Fallback
            const range = document.createRange();
            range.selectNode(texto);
            window.getSelection().removeAllRanges();
            window.getSelection().addRange(range);
            document.execCommand('copy');
            window.getSelection().removeAllRanges();
            showToast('Copy copiada!', 'success');
        });
    }
};

// ====================================
// LÓGICA DO CHAT IA (SOCIAL MEDIA)
// ====================================

async function enviarMsgChat() {
    const input = document.getElementById('ia-chat-input');
    const msg = input.value.trim();
    if (!msg) return;

    input.value = '';
    const container = document.getElementById('ia-chat-messages');

    // Render User Message
    container.innerHTML += `
        <div class="ia-chat-msg ia-chat-user">
            <div class="ia-chat-avatar" style="background:var(--primary-dark);">${Store.getState().currentUser.nome.charAt(0).toUpperCase()}</div>
            <div class="ia-chat-bubble">${escapeHTML(msg)}</div>
        </div>
    `;
    scrollToBottomChat();

    // Render Loading State
    const idLoading = 'loading-' + Date.now();
    container.innerHTML += `
        <div class="ia-chat-msg ia-chat-bot" id="${idLoading}">
            <div class="ia-chat-avatar" style="background:linear-gradient(135deg, #a855f7, #3b82f6);">${Icons.sparkles}</div>
            <div class="ia-chat-bubble ia-chat-loading">
                <span class="dot"></span><span class="dot"></span><span class="dot"></span>
            </div>
        </div>
    `;
    scrollToBottomChat();

    // Call AI Service
    let resposta = '';
    try {
        resposta = await AIService.enviarMensagemChat(msg);
    } catch (err) {
        resposta = 'Desculpe, ocorreu um erro ao se conectar com a IA. Verifique sua chave nas configurações.';
    }

    // Remove Loading
    const loadingEl = document.getElementById(idLoading);
    if (loadingEl) loadingEl.remove();

    // Markdown simple parse (bold and line breaks)
    const formatted = escapeHTML(resposta).replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>');

    // Render Bot Response
    container.innerHTML += `
        <div class="ia-chat-msg ia-chat-bot">
            <div class="ia-chat-avatar" style="background:linear-gradient(135deg, #a855f7, #3b82f6);">${Icons.sparkles}</div>
            <div class="ia-chat-bubble" style="position:relative; min-width:200px;">
                <button onclick="copiarTextoChat(this)" style="position:absolute; top:8px; right:8px; background:var(--gray-100); color:var(--gray-600); border:none; padding:4px 8px; border-radius:4px; font-size:10px; font-weight:700; cursor:pointer; transition:0.2s;">Copiar</button>
                <div style="margin-top:24px;">${formatted}</div>
            </div>
        </div>
    `;
    scrollToBottomChat();
}

window.enviarMsgChat = enviarMsgChat;

function scrollToBottomChat() {
    const container = document.getElementById('ia-chat-messages');
    if (container) {
        container.scrollTop = container.scrollHeight;
    }
}

function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
        tag => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        }[tag] || tag)
    );
}

window.copiarTextoChat = function(btn) {
    const bubble = btn.parentElement;
    const textDiv = bubble.querySelector('div');
    // Gambiarra para pegar texto formatado sem tags HTML
    const temp = document.createElement('div');
    temp.innerHTML = textDiv.innerHTML.replace(/<br\s*[\/]?>/gi, '\\n');
    const text = temp.innerText;

    navigator.clipboard.writeText(text).then(() => {
        const original = btn.innerText;
        btn.innerText = 'Copiado!';
        btn.style.background = 'var(--success)';
        btn.style.color = 'white';
        setTimeout(() => {
            btn.innerText = original;
            btn.style.background = 'var(--gray-100)';
            btn.style.color = 'var(--gray-600)';
        }, 2000);
    });
};

window.abrirModalFeedbackGranular = function(cId, itemId, tipo) {
    const body = `
        <div class="form-group">
            <label class="form-label">Descreva o ajuste necessário</label>
            <textarea id="feedback-granular-texto" class="form-input" rows="4" placeholder="Ex: Mudar a cor do botão para azul..."></textarea>
        </div>
    `;
    const footer = `
        <button class="btn btn-secondary" onclick="closeModal('modal-feedback')">Cancelar</button>
        <button class="btn btn-danger" onclick="confirmarFeedbackGranular('${cId}', '${itemId}', '${tipo}')">Solicitar Ajuste</button>
    `;
    showModal('modal-feedback', 'Solicitar Ajuste', body, footer);
}

window.confirmarFeedbackGranular = function(cId, itemId, tipo) {
    const texto = document.getElementById('feedback-granular-texto').value.trim();
    if (!texto) return showToast('Por favor, descreva o ajuste.', 'warning');
    
    Store.mudarStatusItem(cId, itemId, tipo, 'reprovado', texto);
    closeModal('modal-feedback');
    showToast('Solicitação de ajuste enviada!', 'success');
}
function renderIntelligenceAlerts() {
    const user = Store.getState().currentUser;
    if (user.role !== 'social_media' && user.role !== 'admin' && user.role !== 'master') return '';

    const notifs = Store.getNotificacoes().filter(n => !n.lida);
    if (notifs.length === 0) return '';

    return `
        <div class="animate-fade-in-up" 
             style="background: var(--white); 
                    border: 1px solid var(--primary-100); 
                    border-radius: var(--radius-xl); 
                    padding: var(--space-8); 
                    margin-bottom: var(--space-10); 
                    box-shadow: var(--shadow-lg); 
                    position: relative; 
                    overflow: hidden;">
            
            <!-- Sutil Indigo Glow -->
            <div style="position:absolute; top:-40px; left:-40px; width:200px; height:200px; background:var(--primary); filter:blur(100px); opacity:0.05; border-radius:50%; z-index:0;"></div>
            
            <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:var(--space-6); position:relative; z-index:1;">
                <div style="display:flex; align-items:center; gap:var(--space-4);">
                    <div style="width:48px; height:48px; background:var(--primary-50); border-radius:14px; display:flex; align-items:center; justify-content:center; color:var(--primary);">
                        ${Icons.sparkles}
                    </div>
                    <div>
                        <h3 style="font-size:20px; font-weight:800; color:var(--gray-900); letter-spacing:-0.03em;">SocialFlow Intelligence</h3>
                        <p style="font-size:13px; color:var(--gray-500); font-weight:500;">Destaques estratégicos e ações recomendadas</p>
                    </div>
                </div>
                <button class="btn btn-ghost btn-sm" onclick="window.marcarTodasNotificacoesLidas()" style="font-size:12px; color:var(--primary); background:var(--primary-50); border-radius:100px; padding:6px 16px;">Limpar Alertas</button>
            </div>

            <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(300px, 1fr)); gap:var(--space-4); position:relative; z-index:1;">
                ${notifs.slice(0, 3).map(n => `
                    <div class="card-interactive" 
                         style="background: var(--gray-10); 
                                border: 1px solid var(--gray-100); 
                                padding: var(--space-5); 
                                border-radius: var(--radius-lg); 
                                display: flex; 
                                align-items: center;
                                gap: var(--space-4);
                                cursor: pointer;
                                transition: all 0.3s ease;" 
                         onclick="Store.navigate('cronogramas', {id: '${n.conteudoId}'})">
                        <div style="font-size:24px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));">${n.tipo === 'success' ? '✅' : (n.tipo === 'alerta' ? '⚠️' : '🔔')}</div>
                        <div>
                            <div style="font-size:14px; font-weight:700; color:var(--gray-900); margin-bottom:2px; letter-spacing:-0.01em;">${n.titulo}</div>
                            <div style="font-size:12px; color:var(--gray-500); line-height:1.5;">${n.mensagem}</div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

window.marcarTodasNotificacoesLidas = function() {
    Store.getNotificacoes().forEach(n => {
        if (!n.lida) Store.marcarLida(n.id);
    });
    App.render();
};

// ====================================
// BOARD SOCIAL MEDIA (OPERAÇÃO)
// ====================================

function renderDashboardSocialMedia() {
    const user = Store.getState().currentUser;
    const todosCronogramas = Store.getCronogramas();
    const contaAtiva = Store.getContaAtiva();

    // Filtros Operacionais
    const ativos = todosCronogramas.filter(c => c.status !== 'concluido' && c.status !== 'agendado');
    const notificacoes = Store.getNotificacoes().filter(n => !n.lida).slice(0, 5);

    return `
        ${renderSidebar('dashboard')}
        <main class="main-content">
            <div class="page-header">
                <div>
                    <h1>Operação de Conteúdo</h1>
                    <p style="font-size:14px; color:var(--gray-500); font-weight:500;">Olá, ${user.nome}! ${getGreeting()} ${contaAtiva ? `· <span style="color:var(--primary); font-weight:700;">${contaAtiva.nome}</span>` : ''}</p>
                </div>
                <button class="btn btn-primary" onclick="abrirModalNovoCronograma()">
                    ${Icons.plus} Novo Conteúdo
                </button>
            </div>

            <div class="page-body">
                <!-- Alertas Operacionais -->
                ${renderIntelligenceAlerts()}

                <div class="dashboard-grid">
                    <!-- Fila de Trabalho -->
                    <div class="animate-fade-in">
                        <h2 class="dashboard-section-title">
                            ${Icons.calendar}
                            Conteúdos em Produção
                        </h2>
                        <div class="cronogramas-grid">
                            ${ativos.length > 0 ? ativos.map(c => renderCronogramaCard(c)).join('') : `
                                <div class="card empty-state" style="padding:40px;">
                                    ${Icons.calendar}
                                    <h3>Tudo em dia!</h3>
                                    <p>Nenhum conteúdo pendente para esta conta.</p>
                                </div>
                            `}
                        </div>
                    </div>

                    <!-- Lado Direito: IA e Retornos -->
                    <div style="display:flex; flex-direction:column; gap:var(--space-6);">
                        
                        <!-- Chat Gemini -->
                        <div class="card" style="overflow:hidden; display:flex; flex-direction:column; height:400px; border:none; box-shadow:var(--shadow-md);">
                             <div style="padding:16px; background:linear-gradient(135deg, #a855f7, #3b82f6); color:white; font-weight:700; display:flex; align-items:center; gap:8px;">
                                ${Icons.sparkles} Assistente IA
                             </div>
                             <div id="ia-chat-messages" style="flex:1; overflow-y:auto; padding:16px; background:var(--gray-25); font-size:13px; display:flex; flex-direction:column; gap:12px;">
                                <div class="ia-chat-bubble" style="background:white; padding:12px; border-radius:12px; border:1px solid var(--gray-100);">
                                    Olá, <strong>${user.nome}</strong>! Qual copy ou ideia de conteúdo vamos criar agora?
                                </div>
                             </div>
                             <div style="padding:12px; display:flex; gap:8px; background:white;">
                                <input id="ia-chat-input" class="form-input" style="flex:1; height:40px; font-size:13px;" placeholder="Digite aqui...">
                                <button class="btn btn-primary btn-sm" onclick="enviarMsgChat()">Enviar</button>
                             </div>
                        </div>

                        <!-- Retornos do Cliente -->
                        <div>
                            <h2 class="dashboard-section-title">${Icons.messageCircle} Retornos Recentes</h2>
                            <div class="card" style="padding:16px; max-height:300px; overflow-y:auto; border:none; box-shadow:var(--shadow-sm);">
                                ${notificacoes.length > 0 ? notificacoes.map(n => Security.html`
                                    <div style="padding:10px; border-bottom:1px solid var(--gray-50); font-size:13px; cursor:pointer;" onclick="Store.navigate('cronogramas', {id: '${n.conteudoId}'})">
                                        <div style="font-weight:700; color:var(--gray-900);">${n.titulo}</div>
                                        <div style="color:var(--gray-500); overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${n.mensagem}</div>
                                    </div>
                                `).join('') : `<p style="text-align:center; color:var(--gray-400); font-size:12px;">Sem novos retornos.</p>`}
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </main>
    `;
}
