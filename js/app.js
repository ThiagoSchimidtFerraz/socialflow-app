// ====================================
// SOCIALFLOW — App (Roteador Principal)
// ====================================

const App = {
    async init() {
        // Redirecionamento básico se necessário, mas não bloqueia a inicialização
        const path = window.location.pathname;

        // 1. Inicializar Supabase (tenta conectar)
        const supabaseOk = await SupabaseSync.init();
        
        // 2. Inicializar Store (com ou sem Supabase)
        await Store.init(supabaseOk);
        
        // 3. Proteger Rota: Clientes não podem acessar index.html
        const { currentUser } = Store.getState();
        if (currentUser && currentUser.role === 'cliente') {
            window.location.href = 'portal-cliente.html';
            return;
        }

        // 4. Registrar listener para re-render
        Store.subscribe(() => this.render());
        
        // 5. Renderizar
        this.render();
    },

    render() {
        try {
            const state = Store.getState();
            const { currentPage, currentUser } = state;
            const app = document.getElementById('app');
            
            const saasConfig = state.saasConfig || { broadcast: { ativa: false }, systemStatus: 'normal' };
            
            // 2. BLOQUEIO DE SEGURANÇA (LOCKDOWN)
            if (saasConfig.systemStatus === 'lockdown' && currentUser && currentUser.role !== 'master') {
                app.innerHTML = `
                    <div style="height:100vh; display:flex; flex-direction:column; align-items:center; justify-content:center; background:var(--gray-900); text-align:center; padding:20px;">
                        <div style="font-size:64px; margin-bottom:24px;">🔒</div>
                        <h1 style="color:white; margin-bottom:12px;">SISTEMA EM MANUTENÇÃO CRÍTICA</h1>
                        <p style="color:var(--gray-400); max-width:500px; line-height:1.6;">Esta plataforma foi temporariamente suspensa pelo Administrador Master para atualizações de segurança. Por favor, tente novamente em alguns minutos.</p>
                        <button class="btn btn-outline" style="margin-top:24px;" onclick="window.location.reload()">Tentar Novamente</button>
                    </div>
                `;
                return;
            }

            let html = '';

            // 3. BANNER DE AVISO GLOBAL (BROADCAST)
            if (saasConfig.broadcast.ativa && saasConfig.broadcast.mensagem && currentPage !== 'login') {
                html += `
                    <div class="animate-fade-in" style="background:var(--primary); color:white; padding:10px 24px; display:flex; align-items:center; justify-content:center; gap:12px; font-weight:600; font-size:13px; z-index:9999; position:sticky; top:0;">
                        <span>📢</span>
                        <span>${saasConfig.broadcast.mensagem}</span>
                    </div>
                `;
            }

            switch (currentPage) {
                case 'login':
                    html = renderLoginPage();
                    break;
                case 'dashboard':
                    html = renderDashboard();
                    break;
                case 'cronogramas':
                    html = renderCronogramasPage();
                    break;
                case 'cronograma-detalhes':
                    html = renderCronogramaDetalhesPage();
                    break;
                case 'aprovacoes':
                    html = renderAprovacoesPage();
                    break;
                case 'admin':
                    html = renderAdminPage();
                    break;
                case 'lideranca':
                    html = renderLiderancaPage();
                    break;
                case 'calendario':
                    html = renderCalendarioPage();
                    break;
                case 'historico':
                    html = renderHistoricoPage();
                    break;
                default:
                    console.warn('⚠️ Página desconhecida, redirecionando para Dashboard:', currentPage);
                    html = renderDashboard();
            }

            app.innerHTML = html;
            window.scrollTo(0, 0);
        } catch (err) {
            console.error('💥 ERRO FATAL NA RENDERIZAÇÃO:', err);
            document.body.innerHTML = `<div style="padding:20px; color:red;"><h3>Erro na App</h3><pre>${err.stack}</pre></div>`;
        }
    },
};

window.App = App;

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 App Initializing...');
    App.init();
});
