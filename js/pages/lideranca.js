// ====================================
// SOCIALFLOW — Visão de Liderança (Master)
// ====================================

function renderLiderancaPage() {
    const user = Store.getState().currentUser;
    if (!user || (user.role !== 'admin' && user.role !== 'master')) {
        Store.navigate('dashboard');
        return '';
    }

    const contas = Store.getContas();
    const allCronogramas = Store.getAllCronogramas();

    // Stats globais
    const globalStats = {
        totalClientes: contas.length,
        totalCronogramas: allCronogramas.length,
        rascunho: allCronogramas.filter(c => c.status === 'rascunho').length,
        aprovado: allCronogramas.filter(c => ['aprovado', 'agendado', 'concluido'].includes(c.status)).length,
        aguardando: allCronogramas.filter(c => c.status === 'aguardando_aprovacao_conteudo' || c.status === 'aguardando_aprovacao_artes').length,
        producao: allCronogramas.filter(c => c.status === 'em_producao').length,
        revisao: allCronogramas.filter(c => c.status === 'revisao_conteudo' || c.status === 'revisao_artes').length,
    };

    // Atividades recentes globais
    const todasAtividades = [];
    allCronogramas.forEach(c => {
        const conta = Store.getContaById(c.contaId);
        c.timeline.forEach(t => {
            todasAtividades.push({
                ...t,
                cronogramaTitulo: c.titulo,
                cronogramaId: c.id,
                contaNome: conta ? conta.nome : '',
                contaCor: conta ? conta.cor : '#999',
            });
        });
    });
    todasAtividades.sort((a, b) => new Date(b.data) - new Date(a.data));
    const ultimasAtividades = todasAtividades.slice(0, 12);

    return `
        ${renderSidebar('lideranca')}
        <main class="main-content">
            <div class="page-header">
                <div>
                    <h1 style="font-size:24px; font-weight:800; color:var(--gray-900); letter-spacing:-0.03em;">Visão de Liderança</h1>
                    <p style="font-size:14px; color:var(--gray-500); font-weight:500; margin-top:4px;">Overview estratégico de todas as contas e projetos da agência</p>
                </div>
                <div class="page-header-actions">
                    <button class="btn btn-primary" onclick="abrirModalNovoMembro()">
                        ${Icons.userPlus || Icons.plus} Novo Membro
                    </button>
                </div>
            </div>

            <div class="page-body">
                <!-- Boletim Diário IA -->
                <section style="margin-bottom:var(--space-8);">
                    ${renderAdminAIBrief(contas, allCronogramas)}
                </section>

                <!-- Stats Globais -->
                <div class="animate-fade-in" style="display:grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap:16px; margin-bottom:32px;">
                    <div class="card" style="padding:24px; display:flex; align-items:center; gap:20px;">
                        <div style="width:48px; height:48px; border-radius:14px; background:var(--primary-50); color:var(--primary); display:flex; align-items:center; justify-content:center; font-size:24px;">${Icons.users}</div>
                        <div>
                            <div style="font-size:24px; font-weight:800; color:var(--gray-900);">${globalStats.totalClientes}</div>
                            <div style="font-size:12px; font-weight:700; color:var(--gray-500); text-transform:uppercase; letter-spacing:0.05em;">Clientes</div>
                        </div>
                    </div>
                    <div class="card" style="padding:24px; display:flex; align-items:center; gap:20px;">
                        <div style="width:48px; height:48px; border-radius:14px; background:var(--gray-50); color:var(--gray-600); display:flex; align-items:center; justify-content:center; font-size:24px;">${Icons.calendar}</div>
                        <div>
                            <div style="font-size:24px; font-weight:800; color:var(--gray-900);">${globalStats.totalCronogramas}</div>
                            <div style="font-size:12px; font-weight:700; color:var(--gray-500); text-transform:uppercase; letter-spacing:0.05em;">Pautas</div>
                        </div>
                    </div>
                    <div class="card" style="padding:24px; display:flex; align-items:center; gap:20px;">
                        <div style="width:48px; height:48px; border-radius:14px; background:var(--success-50); color:var(--success); display:flex; align-items:center; justify-content:center; font-size:24px;">${Icons.checkCircle}</div>
                        <div>
                            <div style="font-size:24px; font-weight:800; color:var(--gray-900);">${globalStats.aprovado}</div>
                            <div style="font-size:12px; font-weight:700; color:var(--gray-500); text-transform:uppercase; letter-spacing:0.05em;">Aprovados</div>
                        </div>
                    </div>
                    <div class="card" style="padding:24px; display:flex; align-items:center; gap:20px;">
                        <div style="width:48px; height:48px; border-radius:14px; background:var(--warning-50); color:var(--warning); display:flex; align-items:center; justify-content:center; font-size:24px;">${Icons.clock}</div>
                        <div>
                            <div style="font-size:24px; font-weight:800; color:var(--gray-900);">${globalStats.aguardando + globalStats.producao}</div>
                            <div style="font-size:12px; font-weight:700; color:var(--gray-500); text-transform:uppercase; letter-spacing:0.05em;">Em Fluxo</div>
                        </div>
                    </div>
                </div>

                <!-- Funil de Status Global -->
                <div class="card animate-fade-in" style="padding:24px; margin-bottom:32px; background:var(--white);">
                    <h3 style="font-size:12px; font-weight:800; color:var(--gray-400); text-transform:uppercase; letter-spacing:0.1em; margin-bottom:20px;">Health Score / Funil de Status Operacional</h3>
                    <div class="status-funnel" style="height:12px; border-radius:20px;">
                        ${globalStats.totalCronogramas > 0 ? `
                            ${globalStats.rascunho > 0 ? `<div class="funnel-segment" style="flex:${globalStats.rascunho}; background:var(--gray-200); opacity:0.6;" title="Rascunho: ${globalStats.rascunho}"></div>` : ''}
                            ${globalStats.producao > 0 ? `<div class="funnel-segment" style="flex:${globalStats.producao}; background:var(--primary);" title="Em Produção: ${globalStats.producao}"></div>` : ''}
                            ${globalStats.aguardando > 0 ? `<div class="funnel-segment" style="flex:${globalStats.aguardando}; background:var(--warning);" title="Aguardando: ${globalStats.aguardando}"></div>` : ''}
                            ${globalStats.revisao > 0 ? `<div class="funnel-segment" style="flex:${globalStats.revisao}; background:var(--danger);" title="Revisão: ${globalStats.revisao}"></div>` : ''}
                            ${globalStats.aprovado > 0 ? `<div class="funnel-segment" style="flex:${globalStats.aprovado}; background:var(--success);" title="Aprovado: ${globalStats.aprovado}"></div>` : ''}
                        ` : ''}
                    </div>
                    <div style="display:flex; justify-content:center; gap:24px; margin-top:20px; font-size:11px; font-weight:700; color:var(--gray-500); text-transform:uppercase;">
                        <span style="display:flex; align-items:center; gap:6px;"><span style="width:8px; height:8px; border-radius:50%; background:var(--gray-200);"></span> Rascunho</span>
                        <span style="display:flex; align-items:center; gap:6px;"><span style="width:8px; height:8px; border-radius:50%; background:var(--primary);"></span> Produção</span>
                        <span style="display:flex; align-items:center; gap:6px;"><span style="width:8px; height:8px; border-radius:50%; background:var(--warning);"></span> Aguardando</span>
                        <span style="display:flex; align-items:center; gap:6px;"><span style="width:8px; height:8px; border-radius:50%; background:var(--danger);"></span> Revisão</span>
                        <span style="display:flex; align-items:center; gap:6px;"><span style="width:8px; height:8px; border-radius:50%; background:var(--success);"></span> Aprovado</span>
                    </div>
                </div>

                <!-- HEATMAP & EFICIÊNCIA (v4.0) -->
                <div style="display:grid; grid-template-columns: 1.5fr 1fr; gap:32px; margin-bottom:32px;">
                    <section>
                        <h2 class="dashboard-section-title">
                            ${Icons.activity || '⚡'} Heatmap de Atividade (Últimos 30 dias)
                        </h2>
                        <div class="card" style="padding:24px; background:var(--white);">
                            ${renderActivityHeatmap()}
                        </div>
                    </section>
                    <section>
                        <h2 class="dashboard-section-title">
                            ${Icons.award || '🏆'} Ranking de Eficiência Operacional
                        </h2>
                        <div class="card" style="padding:0; overflow:hidden;">
                            ${renderEfficiencyLeaderboard(allCronogramas)}
                        </div>
                    </section>
                </div>

                <!-- PERFORMANCE INDIVIDUAL POR PROFISSIONAL -->
                <section style="margin-bottom:var(--space-8);">
                    <h2 class="dashboard-section-title animate-fade-in" style="font-size:16px; font-weight:800; color:var(--gray-900); margin-bottom:var(--space-4);">
                        ${Icons.users} Performance Individual por Profissional
                    </h2>
                    <div class="lideranca-performance-grid animate-fade-in" style="display:grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap:20px; animation-delay:0.1s;">
                        ${renderPerformanceIndividual(allCronogramas)}
                    </div>
                </section>

                <!-- Cards por Conta -->
                <h2 class="dashboard-section-title animate-fade-in" style="animation-delay:0.1s;">
                    ${Icons.home} Overview por Conta
                </h2>
                <div class="lideranca-contas-grid animate-fade-in" style="animation-delay:0.15s;">
                    ${contas.map((conta, i) => {
                        const stats = Store.getStatsPorConta(conta.id);
                        const hasAlerts = stats.revisao_solicitada > 0;
                        const membros = Store.getTodosUsuarios().filter(u => u.contasIds.includes(conta.id)).length;
                        return `
                            <div class="card card-interactive lideranca-conta-card ${hasAlerts ? 'has-alert' : ''}" 
                                onclick="irParaConta('${conta.id}')"
                                style="animation: fadeInUp 0.3s ease ${i * 0.06}s both;">
                                <div class="lideranca-conta-header">
                                    <div class="conta-selector-icon" style="background:${conta.cor}; width:44px; height:44px; font-size:var(--font-lg);">
                                        ${conta.nome.charAt(0)}
                                    </div>
                                    <div>
                                        <div style="font-weight:800; font-size:var(--font-base); color:var(--gray-900);">${conta.nome}</div>
                                        <div style="font-size:var(--font-xs); color:var(--gray-400);">${membros} membro(s) · ${stats.total} cronograma(s)</div>
                                    </div>
                                    ${hasAlerts ? `
                                        <span class="badge badge-revisao" style="margin-left:auto; font-size:10px; animation: pulse 2s infinite;">
                                            ${Icons.alertCircle} ${stats.revisao_solicitada} revisão
                                        </span>
                                    ` : ''}
                                </div>
                                <!-- Mini funil da conta -->
                                <div class="lideranca-mini-stats">
                                    <div class="lideranca-mini-stat">
                                        <div class="lideranca-mini-value" style="color:var(--gray-500);">${stats.rascunho}</div>
                                        <div class="lideranca-mini-label">Rascunho</div>
                                    </div>
                                    <div class="lideranca-mini-stat">
                                        <div class="lideranca-mini-value" style="color:var(--info);">${stats.em_producao}</div>
                                        <div class="lideranca-mini-label">Produção</div>
                                    </div>
                                    <div class="lideranca-mini-stat">
                                        <div class="lideranca-mini-value" style="color:var(--warning);">${stats.aguardando_aprovacao}</div>
                                        <div class="lideranca-mini-label">Aguardando</div>
                                    </div>
                                    <div class="lideranca-mini-stat">
                                        <div class="lideranca-mini-value" style="color:var(--danger);">${stats.revisao_solicitada}</div>
                                        <div class="lideranca-mini-label">Revisão</div>
                                    </div>
                                    <div class="lideranca-mini-stat">
                                        <div class="lideranca-mini-value" style="color:var(--success);">${stats.aprovado}</div>
                                        <div class="lideranca-mini-label">Aprovado</div>
                                    </div>
                                </div>
                                <!-- Barra de progresso da conta -->
                                ${stats.total > 0 ? `
                                    <div class="status-funnel" style="height:6px; border-radius:var(--radius-full); margin-top:var(--space-3);">
                                        ${stats.rascunho > 0 ? `<div class="funnel-segment" style="flex:${stats.rascunho}; background:var(--gray-300);"></div>` : ''}
                                        ${stats.em_producao > 0 ? `<div class="funnel-segment" style="flex:${stats.em_producao}; background:var(--info);"></div>` : ''}
                                        ${stats.aguardando_aprovacao > 0 ? `<div class="funnel-segment" style="flex:${stats.aguardando_aprovacao}; background:var(--warning);"></div>` : ''}
                                        ${stats.revisao_solicitada > 0 ? `<div class="funnel-segment" style="flex:${stats.revisao_solicitada}; background:var(--danger);"></div>` : ''}
                                        ${stats.aprovado > 0 ? `<div class="funnel-segment" style="flex:${stats.aprovado}; background:var(--success);"></div>` : ''}
                                    </div>
                                ` : ''}

                                <!-- Termômetros de Refação -->
                                <div style="display:grid; grid-template-columns:1fr 1fr; gap:var(--space-3); margin-top:var(--space-4); border-top:1px solid var(--gray-100); padding-top:var(--space-3);">
                                    ${renderTermometroRefacao(conta.id, allCronogramas, 'cronograma')}
                                    ${renderTermometroRefacao(conta.id, allCronogramas, 'artes')}
                                </div>

                                <!-- Botão de Diagnóstico IA -->
                                <button class="btn btn-dashed btn-sm" 
                                    onclick="event.stopPropagation(); abrirDiagnosticoIA('${conta.id}')"
                                    style="width:100%; margin-top:16px;">
                                    ${Icons.sparkles} Diagnóstico Estratégico IA
                                </button>
                            </div>
                        `;
                    }).join('')}
                </div>

                <div class="dashboard-grid animate-fade-in" style="margin-top:var(--space-8); gap:var(--space-6); grid-template-columns: 1fr;">
                    <!-- VISÃO DE CONTEÚDO POR CLIENTE (Cross-conta) -->
                    <div>
                        <h2 class="dashboard-section-title">
                            ${Icons.layers} Visão de Conteúdo por Cliente
                        </h2>
                        <div class="card card-body" style="padding:0; overflow:hidden;">
                            ${renderConteudoPorCliente(contas, allCronogramas)}
                        </div>
                    </div>
                </div>

                <div class="dashboard-grid animate-fade-in" style="margin-top:var(--space-8); gap:var(--space-6); grid-template-columns: 1.2fr 1fr;">
                    <!-- WORKLOAD POR MEMBRO -->
                    <div>
                        <h2 class="dashboard-section-title">
                            ${Icons.users} Workload por Membro da Equipe
                        </h2>
                        <div class="lideranca-workload-grid">
                            ${renderDetailedWorkload(allCronogramas)}
                        </div>
                    </div>
                    
                    <!-- Rankings & Comparativos -->
                    <div>
                        <h2 class="dashboard-section-title">
                            ${Icons.trendingUp} Ranking & Performance
                        </h2>
                        <div class="card card-body">
                            ${renderRankingContas(contas, allCronogramas)}
                        </div>
                        <div class="card card-body" style="margin-top:var(--space-4);">
                             <h3 style="font-size:var(--font-xs); font-weight:800; color:var(--gray-600); text-transform:uppercase; margin-bottom:var(--space-4);">KPIs de Resposta (Média Dias)</h3>
                             ${renderComparativeKPIs(allCronogramas)}
                        </div>
                    </div>
                </div>

                <!-- Progresso Operacional Mensal (%) -->
                <div class="animate-fade-in" style="margin-top:var(--space-6);">
                    <h2 class="dashboard-section-title">
                        ${Icons.trendingUp} Progresso Operacional Mensal (%)
                    </h2>
                    <div class="card card-body">
                        ${renderProgressoMensal(allCronogramas)}
                    </div>
                </div>

                <!-- Atividades Recentes Globais -->
                <div class="dashboard-grid animate-fade-in" style="animation-delay:0.2s; margin-top:var(--space-6);">
                    <div>
                        <h2 class="dashboard-section-title">
                            ${Icons.clock} Atividades Recentes — Todas as Contas
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
                                                    <strong>${a.acao || 'Ação'}</strong>
                                                    <div style="font-size:var(--font-xs); color:var(--gray-500); margin-top:2px;">
                                                        <span class="admin-conta-tag" style="background:${a.contaCor || '#eee'}20; color:${a.contaCor || '#666'}; border:1px solid ${a.contaCor || '#666'}40;">${a.contaNome || 'Sistema'}</span>
                                                        ${a.cronogramaTitulo || 'Geral'} · ${u ? u.nome : 'Sistema'}
                                                    </div>
                                                    <div class="timeline-time">${formatDateRelative(a.data)}</div>
                                                </div>
                                            </div>
                                        `;
                                    }).join('')}
                                </div>
                            ` : `<p style="text-align:center; color:var(--gray-400); padding:var(--space-6);">Nenhuma atividade</p>`}
                        </div>
                    </div>
                </div>
            </div> <!-- fechando page-body -->
        </main>
    `;
}

function irParaConta(contaId) {
    Store.trocarConta(contaId);
    Store.navigate('dashboard');
}

window.abrirDiagnosticoIA = async function(contaId) {
    const conta = Store.getContaById(contaId);
    const allCronogramas = Store.getAllCronogramas();
    const cronos = allCronogramas.filter(c => c.contaId === contaId);

    if (!AIService.getApiKey()) {
        showToast('Configure sua Gemini API Key em Gestão > Configurações', 'warning');
        return;
    }

    // Calcular KPIs reais para a IA
    const refacaoCronograma = calcularTaxaRefacao(cronos, 'cronograma');
    const refacaoArtes = calcularTaxaRefacao(cronos, 'artes');
    const firstHit = calcularTaxaFirstHit(cronos);
    const tempoResposta = (Math.random() * 2 + 1).toFixed(1); // Simulado

    const body = `
        <div id="ai-loading" style="text-align:center; padding:var(--space-8);">
            <div class="loader" style="margin:0 auto var(--space-4);"></div>
            <p style="color:var(--gray-500); font-weight:600;">O Gemini está analisando os termômetros de <strong>${conta.nome}</strong>...</p>
        </div>
        <div id="ai-result" style="display:none; line-height:1.6; color:var(--gray-700); font-size:var(--font-sm);">
        </div>
    `;
    
    showModal('modal-diagnostico-ia', `Análise Estratégica: ${conta.nome}`, body, '');

    try {
        const diagnostico = await AIService.analisarSaudeConta(conta, {
            refacaoCronograma,
            refacaoArtes,
            firstHit,
            tempoResposta
        });

        const resultEl = document.getElementById('ai-result');
        const loadingEl = document.getElementById('ai-loading');
        
        if (resultEl && loadingEl) {
            loadingEl.style.display = 'none';
            resultEl.style.display = 'block';
            // Renderizando markdown simples
            resultEl.innerHTML = diagnostico.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/### (.*?)\n/g, '<h3 style="margin-top:16px; margin-bottom:8px; color:var(--gray-900);">$1</h3>');
        }
    } catch (error) {
        closeModal('modal-diagnostico-ia');
        showToast(error.message, 'danger');
    }
}

function calcularTaxaRefacao(cronos, tipo) {
    if (cronos.length === 0) return 0;
    const filterKey = tipo === 'cronograma' ? 'conteudo' : 'artes';
    let totalRevisoes = 0;
    cronos.forEach(c => {
        totalRevisoes += c.timeline.filter(t => 
            t.tipo === 'danger' && 
            (t.acao.toLowerCase().includes('revisão') || t.acao.toLowerCase().includes('ajuste')) &&
            t.acao.toLowerCase().includes(filterKey)
        ).length;
    });
    return (totalRevisoes / cronos.length).toFixed(2);
}

function calcularTaxaFirstHit(cronos) {
    const totalAprovacoes = cronos.filter(c => ['aprovado', 'agendado', 'concluido'].includes(c.status)).length;
    if (totalAprovacoes === 0) return 0;
    
    const firstHits = cronos.filter(c => {
        const isAprovado = ['aprovado', 'agendado', 'concluido'].includes(c.status);
        const hasNoRevisions = !c.timeline.some(t => t.tipo === 'danger' && t.acao.toLowerCase().includes('revisão'));
        return isAprovado && hasNoRevisions;
    }).length;
    
    return Math.round((firstHits / totalAprovacoes) * 100);
}

function renderAdminAIBrief(contas, cronogramas) {
    let insights = [];
    let countCritico = 0, countAlerta = 0, countOk = 0, countInativo = 0;
    
    contas.forEach(conta => {
        const cronosConta = cronogramas.filter(c => c.contaId === conta.id);
        const ativos = cronosConta.filter(c => c.status !== 'concluido' && c.status !== 'agendado');
        const aguardandoCliente = ativos.filter(c => c.status === 'aguardando_aprovacao_conteudo' || c.status === 'aguardando_aprovacao_artes').length;
        const atrasados = ativos.filter(c => new Date(c.dataInicio) < new Date(new Date().setHours(0,0,0,0))).length;
        const emProducao = ativos.filter(c => c.status === 'em_producao').length;
        
        if (ativos.length === 0) {
            insights.push({ icon: '💤', text: `${conta.nome} — Sem pautas ativas`, priority: 3 });
            countInativo++;
            return;
        }
        
        if (atrasados > 0) {
            insights.push({ icon: '🔴', text: `${conta.nome} — ${atrasados} post(s) atrasado(s)`, priority: 0 });
            countCritico++;
        } else if (aguardandoCliente > 0) {
            insights.push({ icon: '🟡', text: `${conta.nome} — ${aguardandoCliente} aguardando cliente`, priority: 1 });
            countAlerta++;
        } else if (emProducao > 0) {
            insights.push({ icon: '🔵', text: `${conta.nome} — ${emProducao} em produção`, priority: 2 });
            countOk++;
        } else {
            insights.push({ icon: '🟢', text: `${conta.nome} — Fluxo OK`, priority: 2 });
            countOk++;
        }
    });

    // Ordenar por prioridade (críticos primeiro)
    insights.sort((a, b) => a.priority - b.priority);

    const hoje = new Date();
    const dataFormatada = hoje.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });

    return `
        <div class="card" style="background:linear-gradient(135deg, #1f2937 0%, #111827 100%); color:white; border:none; box-shadow:0 10px 15px -3px rgba(0,0,0,0.1); overflow:hidden; position:relative;">
            <div style="position:absolute; top:-50px; right:-50px; width:200px; height:200px; background:#a855f7; opacity:0.1; filter:blur(40px); border-radius:50%;"></div>
            <div style="padding:var(--space-5) var(--space-6);">
                <!-- Header compacto -->
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:var(--space-4); position:relative; z-index:2;">
                    <div style="display:flex; align-items:center; gap:var(--space-3);">
                        <div style="width:40px; height:40px; border-radius:10px; background:linear-gradient(135deg, #a855f7 0%, #3b82f6 100%); display:flex; align-items:center; justify-content:center; font-size:20px; box-shadow:0 4px 12px rgba(59,130,246,0.3);">
                            ${Icons.sparkles}
                        </div>
                        <div>
                            <h2 style="font-size:var(--font-base); font-weight:800; margin:0;">Boletim Diário da Agência</h2>
                            <div style="font-size:11px; color:var(--gray-400); font-weight:500; text-transform:capitalize;">${dataFormatada}</div>
                        </div>
                    </div>
                    <div style="display:flex; gap:var(--space-3); font-size:11px; font-weight:700;">
                        ${countCritico > 0 ? `<span style="background:rgba(239,68,68,0.2); color:#fca5a5; padding:3px 8px; border-radius:4px;">🔴 ${countCritico}</span>` : ''}
                        ${countAlerta > 0 ? `<span style="background:rgba(245,158,11,0.2); color:#fcd34d; padding:3px 8px; border-radius:4px;">🟡 ${countAlerta}</span>` : ''}
                        <span style="background:rgba(59,130,246,0.15); color:#93c5fd; padding:3px 8px; border-radius:4px;">📊 ${contas.length} contas</span>
                    </div>
                </div>

                <!-- Log compacto com scroll -->
                <div style="max-height:280px; overflow-y:auto; position:relative; z-index:2; border-radius:8px; background:rgba(0,0,0,0.2); border:1px solid rgba(255,255,255,0.06);">
                    ${insights.map((ins, i) => `
                        <div style="display:flex; align-items:center; gap:10px; padding:8px 14px; border-bottom:1px solid rgba(255,255,255,0.04); font-size:13px; ${i === 0 ? '' : ''}">
                            <span style="flex-shrink:0;">${ins.icon}</span>
                            <span style="color:var(--gray-300); flex:1;">${ins.text}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
}

function renderTermometroRefacao(contaId, allCronogramas, tipo) {
    const cronos = allCronogramas.filter(c => c.contaId === contaId);
    if (cronos.length === 0) return '';

    const labelHeader = tipo === 'cronograma' ? 'Refação Cronograma' : 'Refação Artes';
    const filterKey = tipo === 'cronograma' ? 'conteudo' : 'artes';

    // Contar revisões específicas no histórico
    let totalRevisoes = 0;
    cronos.forEach(c => {
        totalRevisoes += c.timeline.filter(t => 
            t.tipo === 'danger' && 
            (t.acao.toLowerCase().includes('revisão') || t.acao.toLowerCase().includes('ajuste')) &&
            t.acao.toLowerCase().includes(filterKey)
        ).length;
    });

    const taxa = totalRevisoes / cronos.length;
    
    // Determinar cor e nível
    let color = 'var(--success)';
    let level = 'Estável';
    if (taxa > 1.2) {
        color = 'var(--danger)';
        level = 'Crítico';
    } else if (taxa > 0.6) {
        color = 'var(--warning)';
        level = 'Alerta';
    }

    return `
        <div>
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                <span style="font-size:9px; font-weight:700; color:var(--gray-500); text-transform:uppercase;">${labelHeader}</span>
                <span style="font-size:9px; font-weight:800; color:${color};">${level}</span>
            </div>
            <div style="height:3px; background:var(--gray-100); border-radius:full; overflow:hidden; display:flex; gap:1px;">
                <div style="flex:1; background:${taxa > 0 ? 'var(--success)' : 'var(--gray-200)'}; height:100%;"></div>
                <div style="flex:1; background:${taxa > 0.6 ? 'var(--warning)' : 'var(--gray-200)'}; height:100%;"></div>
                <div style="flex:1; background:${taxa > 1.2 ? 'var(--danger)' : 'var(--gray-200)'}; height:100%;"></div>
            </div>
        </div>
    `;
}

function renderTeamWorkload(cronogramas) {
    const usuarios = Store.getTodosUsuarios().filter(u => u.role === 'social_media' || u.role === 'designer');
    
    return `
        <div style="display:flex; flex-direction:column; gap:var(--space-4);">
            ${usuarios.map(u => {
                const ativos = cronogramas.filter(c => 
                    (u.role === 'social_media' && c.criadoPor === u.id) || 
                    (u.role === 'designer' && c.artes.some(a => a.criadoPor === u.id)) // Simplificando mock
                ).filter(c => c.status !== 'concluido' && c.status !== 'agendado').length;
                
                const perc = Math.min(100, (ativos / 10) * 100); // 10 é o limite mockado
                const color = ativos > 8 ? 'var(--danger)' : (ativos > 5 ? 'var(--warning)' : 'var(--success)');

                return `
                    <div>
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:var(--space-2);">
                            <div style="display:flex; align-items:center; gap:var(--space-2);">
                                ${renderAvatar(u, 24)}
                                <span style="font-size:var(--font-sm); font-weight:600; color:var(--gray-700);">${u.nome}</span>
                                <span class="badge" style="font-size:10px; padding:2px 6px;">${u.role === 'social_media' ? 'SM' : 'Design'}</span>
                            </div>
                            <span style="font-size:var(--font-sm); font-weight:800; color:${color};">${ativos} ativos</span>
                        </div>
                        <div style="height:6px; background:var(--gray-100); border-radius:var(--radius-full); overflow:hidden;">
                            <div style="width:${perc}%; height:100%; background:${color}; border-radius:var(--radius-full); transition:width 0.5s ease;"></div>
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
    `;
}

function renderEliteKPIs(cronogramas) {
    const totalAprovacoes = cronogramas.filter(c => c.status === 'aprovado' || c.status === 'agendado' || c.status === 'concluido').length;
    
    // 1. FIRST HIT % (Aprovação sem nenhuma revisão/reprovação na timeline)
    const cronogramasFirstHit = cronogramas.filter(c => {
        const isAprovado = ['aprovado', 'agendado', 'concluido'].includes(c.status);
        const hasNoRevisions = !c.timeline.some(t => t.tipo === 'danger' && t.acao.toLowerCase().includes('revisão'));
        return isAprovado && hasNoRevisions;
    }).length;
    const taxaFirstHit = totalAprovacoes > 0 ? Math.round((cronogramasFirstHit / totalAprovacoes) * 100) : 0;

    // 2. MÉDIA DE RESPOSTA DO CLIENTE (Simulado por média de atividade de aprovação)
    // No mockup, pegamos apenas cronogramas com status alto.
    const mediaDiasEspera = (Math.random() * 2 + 1).toFixed(1); // Mockando 1.x dias de espera

    return `
        <div style="display:flex; flex-direction:column; gap:var(--space-6);">
            <div style="display:grid; grid-template-columns:100px 1fr; gap:var(--space-4); align-items:center;">
                <div style="text-align:center;">
                    <div style="font-size:28px; font-weight:900; color:var(--success);">${taxaFirstHit}%</div>
                    <div style="font-size:10px; font-weight:700; color:var(--gray-500); text-transform:uppercase;">First Hit</div>
                </div>
                <div>
                    <div style="font-size:var(--font-sm); font-weight:700; color:var(--gray-700); margin-bottom:4px;">Assertividade de Primeira</div>
                    <div style="font-size:var(--font-xs); color:var(--gray-500); line-height:1.4;">Projetos que o cliente aprovou sem pedir nenhuma alteração.</div>
                </div>
            </div>

            <div style="display:grid; grid-template-columns:100px 1fr; gap:var(--space-4); align-items:center;">
                <div style="text-align:center;">
                    <div style="font-size:28px; font-weight:900; color:var(--primary);">${mediaDiasEspera}</div>
                    <div style="font-size:10px; font-weight:700; color:var(--gray-500); text-transform:uppercase;">Dias</div>
                </div>
                <div>
                    <div style="font-size:var(--font-sm); font-weight:700; color:var(--gray-700); margin-bottom:4px;">Tempo Médio de Retorno</div>
                    <div style="font-size:var(--font-xs); color:var(--gray-500); line-height:1.4;">Tempo que o cliente leva para responder após o material ser finalizado pela equipe.</div>
                </div>
            </div>

            <!-- Alertas de Inatividade -->
            ${renderAlertasInatividade(cronogramas)}
        </div>
    `;
}

function renderAlertasInatividade(cronogramas) {
    const inativos = cronogramas.filter(c => {
        const isAguardando = ['aguardando_aprovacao_conteudo', 'aguardando_aprovacao_artes'].includes(c.status);
        const horasAtraso = (new Date() - new Date(c.criadoEm)) / 3600000;
        return isAguardando && horasAtraso > 48;
    });

    return `
        <div style="border-top:1px solid var(--gray-100); padding-top:var(--space-4);">
            <h4 style="font-size:var(--font-xs); font-weight:800; color:var(--danger); text-transform:uppercase; margin-bottom:var(--space-3); display:flex; align-items:center; gap:var(--space-1);">
                ${Icons.alertCircle} Alertas de Inatividade (${inativos.length})
            </h4>
            ${inativos.length > 0 ? inativos.map(c => `
                <div style="display:flex; justify-content:space-between; align-items:center; background:var(--danger-light); padding:10px 12px; border-radius:var(--radius-md); margin-bottom:var(--space-2); border-left:3px solid var(--danger);">
                    <span style="font-size:var(--font-xs); font-weight:700; color:var(--danger-dark);">${Store.getContaById(c.contaId)?.nome}</span>
                    <span style="font-size:10px; font-weight:600; color:var(--danger-dark); opacity:0.8; text-transform:uppercase;">Parado há 48h+</span>
                </div>
            `).join('') : `
                <p style="font-size:var(--font-xs); color:var(--gray-400); text-align:center;">Nenhum cliente travado hoje. ✨</p>
            `}
        </div>
    `;
}

function renderProgressoMensal(cronogramas) {
    const mesAtual = new Date().toISOString().substring(0, 7);
    const cronosMes = cronogramas.filter(c => c.mesReferencia === mesAtual);
    const total = cronosMes.length;

    if (total === 0) {
        return `<p style="text-align:center; color:var(--gray-400); padding:var(--space-6);">Nenhum cronograma registrado para este mês (${mesAtual}).</p>`;
    }

    const concluidos = cronosMes.filter(c => ['aprovado', 'agendado', 'concluido'].includes(c.status)).length;
    const emAprovação = cronosMes.filter(c => ['aguardando_aprovacao_conteudo', 'aguardando_aprovacao_artes'].includes(c.status)).length;
    const emCriacao = cronosMes.filter(c => ['rascunho', 'em_producao', 'revisao_conteudo', 'revisao_artes'].includes(c.status)).length;

    const percConcluido = Math.round((concluidos / total) * 100);
    const percAprovacao = Math.round((emAprovação / total) * 100);
    const percCriacao = Math.round((emCriacao / total) * 100);

    return `
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:var(--space-6); align-items:flex-start;">
            <!-- Card Concluído -->
            <div style="text-align:center; padding:var(--space-4); border-radius:var(--radius-lg); background:var(--success-light); border:1px solid var(--success-200);">
                <div style="font-size:36px; font-weight:900; color:var(--success-dark);">${percConcluido}%</div>
                <div style="font-size:var(--font-sm); font-weight:700; color:var(--success-700); text-transform:uppercase; margin-bottom:4px;">Feitos no Mês</div>
                <div style="font-size:var(--font-xs); color:var(--success-600); opacity:0.8;">${concluidos} de ${total} cronogramas</div>
            </div>

            <!-- Card Aprovação -->
            <div style="text-align:center; padding:var(--space-4); border-radius:var(--radius-lg); background:var(--warning-light); border:1px solid var(--warning-200);">
                <div style="font-size:36px; font-weight:900; color:var(--warning-dark);">${percAprovacao}%</div>
                <div style="font-size:var(--font-sm); font-weight:700; color:var(--warning-700); text-transform:uppercase; margin-bottom:4px;">Em Aprovação</div>
                <div style="font-size:var(--font-xs); color:var(--warning-600); opacity:0.8;">Aguardando retorno do cliente</div>
            </div>

            <!-- Card Criação -->
            <div style="text-align:center; padding:var(--space-4); border-radius:var(--radius-lg); background:var(--info-light); border:1px solid var(--info-200);">
                <div style="font-size:36px; font-weight:900; color:var(--info-dark);">${percCriacao}%</div>
                <div style="font-size:var(--font-sm); font-weight:700; color:var(--info-700); text-transform:uppercase; margin-bottom:4px;">Em Criação</div>
                <div style="font-size:var(--font-xs); color:var(--info-600); opacity:0.8;">Pautas, briefing ou ajustes</div>
            </div>
        </div>
        
        <!-- Barra de Progresso Unificada -->
        <div style="margin-top:var(--space-6); height:12px; border-radius:var(--radius-full); overflow:hidden; display:flex; background:var(--gray-100);">
            <div style="width:${percConcluido}%; background:var(--success); transition:width 0.5s ease;" title="Concluído"></div>
            <div style="width:${percAprovacao}%; background:var(--warning); transition:width 0.5s ease;" title="Aprovação"></div>
            <div style="width:${percCriacao}%; background:var(--info); transition:width 0.5s ease;" title="Criação"></div>
        </div>
        <div style="display:flex; justify-content:center; gap:var(--space-4); margin-top:var(--space-3); font-size:10px; font-weight:700; color:var(--gray-500); text-transform:uppercase;">
            <span><span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:var(--success); margin-right:4px;"></span> Concluído</span>
            <span><span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:var(--warning); margin-right:4px;"></span> Aprovação</span>
            <span><span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:var(--info); margin-right:4px;"></span> Criação</span>
        </div>
    `;
}

function renderClientesPorSocialMedia() {
    const todosUsuarios = Store.getTodosUsuarios();
    const socialMedias = todosUsuarios.filter(u => u.role === 'social_media');
    
    return `
        <div style="display:flex; flex-direction:column; gap:var(--space-3);">
            ${socialMedias.length > 0 ? socialMedias.map(sm => {
                const totalClientes = sm.contasIds.length;
                return `
                    <div style="display:flex; justify-content:space-between; align-items:center; padding:var(--space-2) var(--space-3); background:var(--gray-50); border-radius:var(--radius-md);">
                        <div style="display:flex; align-items:center; gap:var(--space-2);">
                            <div style="width:8px; height:8px; border-radius:50%; background:var(--primary);"></div>
                            <span style="font-size:var(--font-sm); font-weight:700; color:var(--gray-800);">${sm.nome}</span>
                        </div>
                        <span style="font-size:var(--font-sm); font-weight:800; color:var(--primary-700);">${totalClientes} clientes</span>
                    </div>
                `;
            }).join('') : '<p style="text-align:center; color:var(--gray-400);">Nenhum Social Media cadastrado.</p>'}
        </div>
    `;
}

function renderConteudoPorCliente(contas, cronogramas) {
    return `
        <table class="data-table" style="width:100%; border-collapse:collapse;">
            <thead>
                <tr>
                    <th>Conta</th>
                    <th>SM Responsável</th>
                    <th>Status do Mês</th>
                    <th>Última Atividade</th>
                    <th>Status de Alerta</th>
                </tr>
            </thead>
            <tbody>
                ${contas.map(conta => {
                    const cronos = cronogramas.filter(c => c.contaId === conta.id);
                    const lastC = cronos.sort((a,b) => new Date(b.criadoEm) - new Date(a.criadoEm))[0];
                    const sm = Store.getTodosUsuarios().find(u => u.contasIds.includes(conta.id) && u.role === 'social_media');
                    
                    const diasInativo = lastC ? Math.floor((new Date() - new Date(lastC.criadoEm)) / 86400000) : 99;
                    const isIdle = diasInativo >= 5;

                    return `
                        <tr style="${isIdle ? 'background:rgba(239, 68, 68, 0.05);' : ''}">
                            <td>
                                <div style="display:flex; align-items:center; gap:8px;">
                                    <div style="width:8px; height:8px; border-radius:50%; background:${conta.cor};"></div>
                                    <strong>${conta.nome}</strong>
                                </div>
                            </td>
                            <td>${sm ? sm.nome : '--'}</td>
                            <td>${lastC ? renderStatusBadge(lastC.status) : '<span class="badge">Vazio</span>'}</td>
                            <td style="font-size:12px;">${lastC ? formatDateRelative(lastC.criadoEm) : 'Nunca'}</td>
                            <td>
                                ${isIdle ? 
                                    `<span class="badge badge-danger" style="animation:pulse 2s infinite;">${Icons.alertCircle} PARADO (${diasInativo} dias)</span>` : 
                                    `<span class="badge badge-success">Ativo</span>`
                                }
                            </td>
                        </tr>
                    `;
                }).join('')}
            </tbody>
        </table>
    `;
}

function renderDetailedWorkload(cronogramas) {
    const usuarios = Store.getTodosUsuarios().filter(u => u.role === 'social_media' || u.role === 'designer');
    
    return usuarios.map(u => {
        const ativos = cronogramas.filter(c => 
            (u.role === 'social_media' && c.criadoPor === u.id) || 
            (u.role === 'designer' && c.artes.some(a => a.criadoPor === u.id))
        ).filter(c => c.status !== 'concluido' && c.status !== 'agendado');

        const emAtraso = ativos.filter(c => new Date(c.dataInicio) < new Date()).length;
        const count = ativos.length;
        
        let stressClass = 'success';
        if (count >= 7) stressClass = 'danger';
        else if (count >= 4) stressClass = 'warning';

        return `
            <div class="card card-interactive" onclick="abrirModalWorkload('${u.id}')" style="margin-bottom:12px; border-left:4px solid var(--${stressClass});">
                <div style="padding:16px;">
                    <div style="display:flex; align-items:center; gap:12px; margin-bottom:12px;">
                        ${renderAvatar(u, 40)}
                        <div style="flex:1;">
                            <div style="font-weight:700; color:var(--gray-900);">${u.nome}</div>
                            <span class="badge" style="font-size:10px;">${u.role.replace('_', ' ').toUpperCase()}</span>
                        </div>
                        <div style="text-align:right;">
                            <div style="font-size:20px; font-weight:800; color:var(--${stressClass});">${count}</div>
                            <div style="font-size:9px; color:var(--gray-400); text-transform:uppercase;">Demandas</div>
                        </div>
                    </div>
                    <div style="display:flex; justify-content:space-between; font-size:11px;">
                        <span style="color:var(--gray-500);">Tempo Médio: <b>2.4 dias</b></span>
                        <span style="${emAtraso > 0 ? 'color:var(--danger); font-weight:700;' : 'color:var(--success);'}">Atrasos: ${emAtraso}</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function renderRankingContas(contas, cronogramas) {
    const ranking = contas.map(c => {
        const myCronos = cronogramas.filter(cr => cr.contaId === c.id);
        const aprovados = myCronos.filter(cr => ['aprovado', 'agendado'].includes(cr.status)).length;
        return { nome: c.nome, score: aprovados, total: myCronos.length };
    }).sort((a,b) => b.score - a.score).slice(0, 5);

    return `
        <div style="margin-bottom:16px;">
            <h3 style="font-size:11px; font-weight:800; color:var(--gray-400); text-transform:uppercase; margin-bottom:12px;">Ranking de Aprovação (Posts/Mês)</h3>
            ${ranking.map(r => `
                <div style="margin-bottom:10px;">
                    <div style="display:flex; justify-content:space-between; font-size:12px; margin-bottom:4px;">
                        <span>${r.nome}</span>
                        <b>${r.score} aprovados</b>
                    </div>
                    <div style="height:6px; background:var(--gray-100); border-radius:10px; overflow:hidden;">
                        <div style="width:${(r.score / (r.total || 1)) * 100}%; background:var(--primary); height:100%;"></div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

function renderComparativeKPIs(cronogramas) {
    const smList = Store.getTodosUsuarios().filter(u => u.role === 'social_media');
    
    return smList.map(sm => {
        const myCronos = cronogramas.filter(c => c.criadoPor === sm.id);
        const total = myCronos.length;
        const firstHit = total > 0 ? calcularTaxaFirstHit(myCronos) : 0;
        
        return `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; font-size:12px;">
                <span>${sm.nome}</span>
                <div style="display:flex; gap:12px;">
                    <span title="First Hit" style="color:var(--success);"><b>${firstHit}%</b></span>
                    <span title="Volume" style="color:var(--gray-400);">${total}p</span>
                </div>
            </div>
        `;
    }).join('');
}

window.abrirModalWorkload = function(userId) {
    const user = Store.getTodosUsuarios().find(u => u.id === userId);
    const cronos = Store.getAllCronogramas().filter(c => 
        (user.role === 'social_media' && c.criadoPor === userId) || 
        (user.role === 'designer' && c.artes.some(a => a.criadoPor === userId))
    ).filter(c => c.status !== 'concluido');

    const body = `
        <div style="display:flex; flex-direction:column; gap:12px;">
            ${cronos.length > 0 ? cronos.map(c => `
                <div class="card" style="padding:12px; background:var(--gray-50);">
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <div>
                            <div style="font-weight:700; font-size:13px;">${c.titulo}</div>
                            <div style="font-size:11px; color:var(--gray-500);">${Store.getContaById(c.contaId)?.nome}</div>
                        </div>
                        ${renderStatusBadge(c.status)}
                    </div>
                </div>
            `).join('') : '<p style="text-align:center; color:var(--gray-400); padding:20px;">Nenhuma demanda ativa.</p>'}
        </div>
    `;
    showModal('modal-workload', `Fila de ${user.nome}`, body, '');
}

function renderPerformanceIndividual(allCronogramas) {
    const usuarios = Store.getTodosUsuarios().filter(u => u.role === 'social_media' || u.role === 'designer');
    
    if (usuarios.length === 0) {
        return `
            <div class="card card-body" style="grid-column: 1 / -1; text-align:center; padding:var(--space-8); background:var(--gray-50); border:2px dashed var(--gray-200);">
                <div style="font-size:24px; margin-bottom:12px;">👥</div>
                <p style="color:var(--gray-500); font-size:14px;">Nenhum profissional cadastrado na equipe.</p>
                <button class="btn btn-primary btn-sm" onclick="abrirModalNovoMembro()" style="margin-top:var(--space-4);">Cadastrar Primeiro Membro</button>
            </div>
        `;
    }

    return usuarios.map(u => {
        const isSM = u.role === 'social_media';
        const myCronos = allCronogramas.filter(c => 
            (isSM && c.criadoPor === u.id) || 
            (!isSM && c.artes.some(a => a.criadoPor === u.id))
        );

        const total = myCronos.length;
        const aprovados = myCronos.filter(c => ['aprovado', 'agendado', 'concluido'].includes(c.status)).length;
        
        // Métricas de Refação
        const filterKey = isSM ? 'conteudo' : 'artes';
        let totalRevisoes = 0;
        myCronos.forEach(c => {
            totalRevisoes += (c.timeline || []).filter(t => 
                t.tipo === 'danger' && 
                (t.acao.toLowerCase().includes('revisão') || t.acao.toLowerCase().includes('ajuste')) &&
                t.acao.toLowerCase().includes(filterKey)
            ).length;
        });

        const taxaRefacao = total > 0 ? (totalRevisoes / total) : 0;
        const firstHit = total > 0 ? calcularTaxaFirstHit(myCronos) : 0;
        
        // Badge de Saúde
        let saudeColor = 'var(--success)';
        let saudeLabel = '💎 Elite';
        if (taxaRefacao > 1.2) { saudeColor = 'var(--danger)'; saudeLabel = '🚨 Crítico'; }
        else if (taxaRefacao > 0.6) { saudeColor = 'var(--warning)'; saudeLabel = '⚠️ Alerta'; }
        else if (total > 0 && taxaRefacao <= 0.3) { saudeLabel = '💎 Estável'; }

        return `
            <div class="card performance-card" style="padding:16px; position:relative; overflow:hidden;">
                <div style="display:flex; align-items:center; gap:12px; margin-bottom:16px;">
                    ${renderAvatar(u, 44)}
                    <div style="flex:1;">
                        <div style="font-weight:800; font-size:14px; color:var(--gray-900);">${u.nome}</div>
                        <div style="font-size:10px; color:var(--gray-400); text-transform:uppercase; font-weight:700;">${isSM ? 'Social Media' : 'Designer'}</div>
                    </div>
                    <span style="font-size:9px; padding:2px 8px; border-radius:20px; font-weight:800; background:${saudeColor}15; color:${saudeColor}; border:1px solid ${saudeColor}30;">
                        ${saudeLabel}
                    </span>
                </div>
                
                <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:8px; margin-bottom:16px; padding:12px; background:var(--gray-50); border-radius:8px;">
                    <div style="text-align:center;">
                        <div style="font-size:16px; font-weight:800; color:var(--gray-900);">${total}</div>
                        <div style="font-size:9px; color:var(--gray-400); text-transform:uppercase; font-weight:600;">${isSM ? 'Pautas' : 'Artes'}</div>
                    </div>
                    <div style="text-align:center;">
                        <div style="font-size:16px; font-weight:800; color:var(--success);">${firstHit}%</div>
                        <div style="font-size:9px; color:var(--gray-400); text-transform:uppercase; font-weight:600;">First Hit</div>
                    </div>
                    <div style="text-align:center;">
                        <div style="font-size:16px; font-weight:800; color:${taxaRefacao > 1 ? 'var(--danger)' : 'var(--gray-700)'};">${taxaRefacao.toFixed(1)}</div>
                        <div style="font-size:9px; color:var(--gray-400); text-transform:uppercase; font-weight:600;">Refação</div>
                    </div>
                </div>

                <div style="margin-top:auto;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                        <span style="font-size:10px; color:var(--gray-500); font-weight:600;">Taxa de Aprovação</span>
                        <span style="font-size:10px; color:var(--gray-900); font-weight:800;">${total > 0 ? Math.round((aprovados/total)*100) : 0}%</span>
                    </div>
                    <div style="height:4px; background:var(--gray-100); border-radius:10px; overflow:hidden;">
                        <div style="width:${total > 0 ? (aprovados/total)*100 : 0}%; background:${saudeColor}; height:100%;"></div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

window.abrirModalNovoMembro = function() {
    const contas = Store.getContas();
    const body = `
        <div class="login-form">
            <div class="form-group">
                <label class="form-label">Nome Completo</label>
                <input type="text" id="membro-nome" class="form-input" placeholder="Ex: João Silva">
            </div>
            <div class="form-group">
                <label class="form-label">E-mail</label>
                <input type="email" id="membro-email" class="form-input" placeholder="exemplo@email.com">
            </div>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px;">
                <div class="form-group">
                    <label class="form-label">Função / Role</label>
                    <select id="membro-role" class="form-input">
                        <option value="social_media">Social Media</option>
                        <option value="designer">Designer</option>
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">Senha Temporária</label>
                    <input type="text" id="membro-senha" class="form-input" value="social123">
                </div>
            </div>
            <div class="form-group">
                <label class="form-label">Vincular aos Clientes</label>
                <div style="max-height:120px; overflow-y:auto; border:1px solid var(--gray-200); border-radius:8px; padding:12px; display:flex; flex-direction:column; gap:8px;">
                    ${contas.map(c => `
                        <label style="display:flex; align-items:center; gap:8px; font-size:12px; color:var(--gray-700); cursor:pointer;">
                            <input type="checkbox" name="membro-contas" value="${c.id}" checked>
                            <span style="width:8px; height:8px; border-radius:50%; background:${c.cor};"></span>
                            ${c.nome}
                        </label>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
    const footer = `
        <button class="btn btn-ghost" onclick="closeModal('modal-novo-membro')">Cancelar</button>
        <button class="btn btn-primary" onclick="handleCriarMembro()">Criar Membro</button>
    `;
    showModal('modal-novo-membro', 'Adicionar Novo Membro ao Time', body, footer);
};

window.handleCriarMembro = function() {
    const nome = document.getElementById('membro-nome').value;
    const email = document.getElementById('membro-email').value;
    const role = document.getElementById('membro-role').value;
    const senha = document.getElementById('membro-senha').value;
    
    const checkboxes = document.querySelectorAll('input[name="membro-contas"]:checked');
    const contasIds = Array.from(checkboxes).map(cb => cb.value);

    if (!nome || !email) {
        showToast('Preencha nome e e-mail corretamente.', 'warning');
        return;
    }

    const res = Store.criarMembro({ nome, email, role, senha, contasIds });
    if (res.success) {
        closeModal('modal-novo-membro');
        showToast(`Membro criado com sucesso!`, 'success');
        App.render();
    } else {
        showToast(res.error, 'danger');
    }
};

// ====================================
// NOVAS FUNÇÕES DE INTELIGÊNCIA (v4.0)
// ====================================

function renderActivityHeatmap() {
    const data = Store.getHeatmapData();
    const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const hours = Array.from({length: 12}, (_, i) => (i * 2) + ':00'); // Step of 2 hours for compactness

    let html = `
        <div class="heatmap-container" style="display:flex; flex-direction:column; gap:8px;">
            <div style="display:flex; gap:8px; padding-left:40px; margin-bottom:8px;">
                ${hours.map(h => `<div style="flex:1; font-size:9px; color:var(--gray-400); text-align:center;">${h}</div>`).join('')}
            </div>
    `;

    days.forEach((day, dIdx) => {
        html += `
            <div style="display:flex; align-items:center; gap:8px;">
                <div style="width:32px; font-size:10px; font-weight:700; color:var(--gray-500);">${day}</div>
                <div style="flex:1; display:flex; gap:4px; height:24px;">
                    ${Array.from({length: 12}).map((_, hBlock) => {
                        const count1 = data[`${dIdx}_${hBlock * 2}`] || 0;
                        const count2 = data[`${dIdx}_${hBlock * 2 + 1}`] || 0;
                        const total = count1 + count2;
                        
                        let opacity = 0.05;
                        if (total > 10) opacity = 0.9;
                        else if (total > 5) opacity = 0.6;
                        else if (total > 2) opacity = 0.3;
                        else if (total > 0) opacity = 0.15;

                        return `<div style="flex:1; background:var(--primary); opacity:${opacity}; border-radius:4px;" title="${total} ações neste período"></div>`;
                    }).join('')}
                </div>
            </div>
        `;
    });

    html += `
            <div style="margin-top:16px; display:flex; justify-content:flex-end; align-items:center; gap:8px; font-size:10px; color:var(--gray-400);">
                <span>Menos</span>
                <div style="width:12px; height:12px; background:var(--primary); opacity:0.1; border-radius:2px;"></div>
                <div style="width:12px; height:12px; background:var(--primary); opacity:0.4; border-radius:2px;"></div>
                <div style="width:12px; height:12px; background:var(--primary); opacity:0.7; border-radius:2px;"></div>
                <div style="width:12px; height:12px; background:var(--primary); opacity:1; border-radius:2px;"></div>
                <span>Mais atividade</span>
            </div>
        </div>
    `;
    return html;
}

function renderEfficiencyLeaderboard(cronos) {
    const users = Store.getTodosUsuarios().filter(u => u.role === 'social_media' || u.role === 'designer');
    const ranking = users.map(u => {
        const myCronos = cronos.filter(c => 
            c.criadoPor === u.id || 
            c.timeline.some(t => t.userId === u.id)
        );
        const resolved = myCronos.filter(c => ['aprovado', 'agendado', 'concluido'].includes(c.status)).length;
        const total = myCronos.length;
        const efficiency = total > 0 ? Math.round((resolved / total) * 100) : 0;
        
        return { 
            nome: u.nome, 
            avatar: u.avatar, 
            role: u.role, 
            efficiency, 
            resolved, 
            total 
        };
    }).sort((a, b) => b.efficiency - a.efficiency || b.resolved - a.resolved);

    return `
        <table style="width:100%; border-collapse:collapse; font-size:13px; color:var(--gray-700);">
            <thead>
                <tr style="background:var(--gray-50); text-align:left; border-bottom:1px solid var(--gray-100);">
                    <th style="padding:12px 16px;">Profissional</th>
                    <th style="padding:12px 16px;">Eficiência</th>
                    <th style="padding:12px 16px; text-align:right;">Concluídos</th>
                </tr>
            </thead>
            <tbody>
                ${ranking.map((r, i) => `
                    <tr style="border-bottom:1px solid var(--gray-50);">
                        <td style="padding:12px 16px;">
                            <div style="display:flex; align-items:center; gap:10px;">
                                <div style="font-size:11px; font-weight:800; color:var(--gray-300); width:14px;">${i+1}</div>
                                <div style="width:28px; height:28px; border-radius:50%; background:var(--primary-100); color:var(--primary-700); display:flex; align-items:center; justify-content:center; font-size:10px; font-weight:800;">${r.avatar || '👤'}</div>
                                <div>
                                    <div style="font-weight:700;">${r.nome || 'Usuário'}</div>
                                    <div style="font-size:9px; color:var(--gray-400); text-transform:uppercase;">${(r.role || '').replace('_', ' ')}</div>
                                </div>
                            </div>
                        </td>
                        <td style="padding:12px 16px;">
                            <div style="display:flex; align-items:center; gap:8px;">
                                <div style="flex:1; height:4px; background:var(--gray-100); border-radius:2px; max-width:60px;">
                                    <div style="width:${r.efficiency}%; height:100%; background:${r.efficiency > 80 ? 'var(--success)' : (r.efficiency > 50 ? 'var(--warning)' : 'var(--danger)')}; border-radius:2px;"></div>
                                </div>
                                <b style="color:var(--gray-900);">${r.efficiency}%</b>
                            </div>
                        </td>
                        <td style="padding:12px 16px; text-align:right; font-weight:800; color:var(--gray-900);">${r.resolved}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}
