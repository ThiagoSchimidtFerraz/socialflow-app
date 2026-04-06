// ====================================
// SOCIALFLOW — Portal do Cliente
// Roteador Específico para o Dashboard Isolado
// ====================================

// Flag global para desativar a Sidebar e outros elementos administrativos
window.PORTAL_CLIENTE = true;

const PortalCliente = {
    async init() {
        // 1. Inicializar Supabase (tenta conectar)
        const supabaseOk = await SupabaseSync.init();
        
        // 2. Inicializar Store (com ou sem Supabase)
        await Store.init(supabaseOk);
        
        // 3. Proteger Rota: Somente clientes podem acessar este portal
        const { currentUser } = Store.getState();
        if (currentUser && currentUser.role !== 'cliente') {
            window.location.href = 'index.html';
            return;
        }

        // 4. Registrar listener para re-render
        Store.subscribe(() => this.render());
        
        // 5. Renderizar
        this.render();
    },

    render() {
        const state = Store.getState();
        const { currentPage, currentUser } = state;
        const app = document.getElementById('app');
        
        // Bloqueio de Rota para deslogados
        if (!currentUser) {
            app.innerHTML = renderLoginPage();
            return;
        }

        let contentHtml = '';
        
        // O cliente usa apenas duas views internamente
        if (currentPage === 'cronograma-detalhes') {
            contentHtml = renderCronogramaDetalhesPage();
        } else {
            // Default 
            contentHtml = renderAprovacoesPage();
        }

        app.innerHTML = `
            <style>
                /* Ocultar barra lateral e forçar tela cheia */
                .app-layout { display: block !important; }
                .main-content { margin-left: 0 !important; width: 100% !important; min-height: 100vh; }
            </style>
            <div class="app-layout">
                <header style="background:var(--white); padding:var(--space-4) var(--space-8); display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--gray-200); position:sticky; top:0; z-index:900;">
                    <div style="display:flex; align-items:center; gap:var(--space-3);">
                        <div style="width:40px; height:40px; background:linear-gradient(135deg, var(--primary), var(--primary-dark)); border-radius:12px; display:flex; align-items:center; justify-content:center; color:white;">
                            ${Icons.checkCircle}
                        </div>
                        <h1 style="font-size:20px; font-weight:800; color:var(--gray-900); letter-spacing:-0.02em;">Portal de Aprovações</h1>
                    </div>
                    <div style="display:flex; align-items:center; gap:var(--space-4);">
                        <div style="display:flex; align-items:center; gap:var(--space-2);">
                            <div style="width:32px; height:32px; border-radius:50%; background:var(--primary-light); color:var(--primary-dark); display:flex; align-items:center; justify-content:center; font-weight:700; font-size:12px;">
                                ${currentUser.nome.charAt(0).toUpperCase()}
                            </div>
                            <span style="font-size:14px; font-weight:600; color:var(--gray-800);">${currentUser.nome}</span>
                        </div>
                        <button class="btn btn-outline btn-sm" onclick="Store.logout()">
                            ${Icons.logOut} Sair
                        </button>
                    </div>
                </header>
                ${contentHtml}
            </div>
        `;
        
        window.scrollTo(0, 0);
    }
};

// Iniciar a aplicação do cliente quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    PortalCliente.init();
});
