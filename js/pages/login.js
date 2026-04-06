// ====================================
// SOCIALFLOW — Página de Login & Cadastro
// ====================================

// Handlers GLOBAIS (Declarados no topo para evitar atrasos)
window.selecionarTipoAcesso = function(role) {
    console.log('--- 👆 CLIQUE DETECTADO ---', role);
    if (!window.App) {
        alert('Carregando sistema... Por favor, aguarde 2 segundos e tente novamente.');
        return;
    }
    loginRoleSelecionado = role;
    loginMode = 'login';
    window.App.render();
};

window.voltarSelecaoAcesso = function() {
    loginRoleSelecionado = null;
    loginMode = 'login';
    cadastroRole = null;
    window.App.render();
};

window.irParaCadastro = function() {
    cadastroRole = loginRoleSelecionado;
    loginMode = 'cadastro';
    window.App.render();
};

let loginMode = 'login'; 
let loginRoleSelecionado = null; 
let cadastroRole = null;

function renderLoginPage() {
    if (loginMode === 'cadastro') return renderCadastroPage();

    const isPortalCliente = window.PORTAL_CLIENTE || window.location.hash === '#cliente';
    
    if (isPortalCliente) {
        loginRoleSelecionado = 'cliente';
    }

    return `
        <div class="login-page">
            <div class="login-bg-pattern"></div>
            <div class="login-card">
                <div class="login-logo">
                    <img src="assets/logo.png" alt="SocialFlow" class="app-logo-login">
                    <p style="color:var(--gray-50); font-size:14px; font-weight:600; margin-top:-10px; opacity:0.8; letter-spacing:1px; text-transform:uppercase;">Sistema de Gestão 360°</p>
                </div>

                ${loginRoleSelecionado ? renderLoginForm(isPortalCliente) : renderLoginAccessCards()}
            </div>
        </div>
    `;
}

function renderLoginAccessCards() {
    return `
        <div style="font-size:11px; color:var(--gray-400); text-align:center; font-weight:800; text-transform:uppercase; letter-spacing:0.15em; margin:40px 0 20px;">Selecione seu Perfil</div>
        <div class="login-access-grid">
            <button class="login-access-card" onclick="selecionarTipoAcesso('admin')">
                <div class="login-access-icon" style="background:var(--gray-900);">
                    ${Icons.barChart}
                </div>
                <div class="login-access-label">Liderança</div>
            </button>
            <button class="login-access-card" onclick="selecionarTipoAcesso('social_media')">
                <div class="login-access-icon" style="background:var(--primary);">
                    ${Icons.edit}
                </div>
                <div class="login-access-label">Social Media</div>
            </button>
            <button class="login-access-card" onclick="selecionarTipoAcesso('designer')">
                <div class="login-access-icon" style="background:hsl(330, 81%, 60%);">
                    ${Icons.palette}
                </div>
                <div class="login-access-label">Designer</div>
            </button>
        </div>
    `;
}

function renderLoginForm(isPortalCliente = false) {
    const roleLabels = {
        admin: 'Liderança',
        social_media: 'Social Media',
        designer: 'Designer',
        cliente: 'Cliente',
    };
    const roleColors = {
        admin: 'linear-gradient(135deg, var(--gray-700), var(--gray-900))',
        social_media: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
        designer: 'linear-gradient(135deg, #EC4899, #F43F5E)',
        cliente: 'linear-gradient(135deg, #10B981, #059669)',
    };
    const roleIcons = {
        admin: Icons.barChart,
        social_media: Icons.edit,
        designer: Icons.palette,
        cliente: Icons.checkCircle,
    };

    return `
        <!-- Header com tipo selecionado -->
        <div class="login-role-selected">
            <div class="login-access-icon" style="background:${roleColors[loginRoleSelecionado]}; width:40px; height:40px;">
                ${roleIcons[loginRoleSelecionado]}
            </div>
            <div>
                <div style="font-weight:700; color:var(--gray-800); font-size:var(--font-base);">
                    ${loginRoleSelecionado === 'cliente' ? 'Portal do Cliente' : `Acesso ${roleLabels[loginRoleSelecionado]}`}
                </div>
                <div style="font-size:var(--font-xs); color:var(--gray-400);">Entre com seu e-mail e senha</div>
            </div>
            ${!isPortalCliente ? `
                <button class="btn btn-ghost btn-sm" onclick="voltarSelecaoAcesso()" style="margin-left:auto;" title="Voltar">
                    ${Icons.arrowLeft}
                </button>
            ` : ''}
        </div>

        <form class="login-form" onsubmit="handleLogin(event)">
            ${window.PublicKeyCredential && localStorage.getItem('socialflow_biometria') ? `
                <div style="margin-bottom:var(--space-4);">
                    <button type="button" class="btn btn-secondary btn-lg" style="width:100%; justify-content:center; gap:12px; border:2px solid var(--primary-100); background:var(--primary-50); color:var(--primary-dark);" onclick="loginComBiometria()">
                        <div style="color:var(--primary); display:flex;">${Icons.fingerprint || Icons.eye}</div>
                        <span style="font-weight:800;">Acesso Rápido</span>
                    </button>
                    <div style="text-align:center; margin:16px 0 8px; font-size:11px; color:var(--gray-400); text-transform:uppercase; letter-spacing:1px; font-weight:800; display:flex; align-items:center; gap:8px;">
                        <span style="flex:1; height:1px; background:var(--gray-200);"></span>
                        <span>Ou use a senha</span>
                        <span style="flex:1; height:1px; background:var(--gray-200);"></span>
                    </div>
                </div>
            ` : ''}

            <div class="form-group">
                <label class="form-label">E-mail</label>
                <input type="email" class="form-input" id="login-email" placeholder="seu@email.com" autocomplete="email" required>
            </div>
            <div class="form-group">
                <label class="form-label">Senha</label>
                <input type="password" class="form-input" id="login-senha" placeholder="Digite sua senha" autocomplete="current-password" required>
            </div>

            <div id="login-error" style="display:none; background:var(--danger-light); color:var(--danger-dark); padding:var(--space-3); border-radius:var(--radius-md); font-size:var(--font-sm); text-align:center;"></div>

            <button type="submit" class="btn btn-primary btn-lg" style="width:100%;">
                ${Icons.arrowRight}
                <span>Entrar</span>
            </button>
        </form>

        <div style="text-align:center; margin-top:var(--space-5); padding-top:var(--space-4); border-top:1px solid var(--gray-100);">
            <p style="font-size:var(--font-xs); color:var(--gray-400); margin-top:var(--space-4); cursor:pointer; text-decoration:underline;" onclick="Store.systemHardReset()">
                Limpar Cache / Resetar Sistema
            </p>
        </div>
    `;
}

function renderCadastroPage() {
    const roleLabels = {
        admin: 'Liderança',
        social_media: 'Social Media',
        designer: 'Designer',
        cliente: 'Cliente',
    };

    // Mensagem de quem aprova
    const aprovacaoMsg = {
        admin: 'Contas de Liderança são criadas pela plataforma. Entre em contato com o suporte.',
        social_media: 'Seu cadastro será enviado para aprovação da <strong>Liderança</strong>.',
        designer: 'Seu cadastro será enviado para aprovação da <strong>Liderança</strong>.',
        cliente: 'Seu cadastro será enviado para aprovação do <strong>Social Media</strong> responsável.',
    };

    return `
        <div class="login-page">
            <div class="login-bg-pattern"></div>
            <div class="login-card" style="max-width:480px;">
                <div class="login-logo">
                    <div class="logo-icon">${Icons.sparkles}</div>
                    <h1>Social<span>Flow</span></h1>
                    <p>Criar conta · Acesso ${roleLabels[cadastroRole] || ''}</p>
                </div>

                ${cadastroRole === 'admin' ? `
                    <div class="card" style="padding:var(--space-5); text-align:center;">
                        <div style="color:var(--warning); margin-bottom:var(--space-3);">${Icons.alertCircle}</div>
                        <p style="color:var(--gray-600); font-size:var(--font-sm); line-height:1.6;">
                            ${aprovacaoMsg.admin}
                        </p>
                        <button class="btn btn-secondary" style="margin-top:var(--space-4);" onclick="voltarSelecaoAcesso()">
                            ${Icons.arrowLeft} Voltar
                        </button>
                    </div>
                ` : `
                    <div style="background:var(--primary-50); border:1px solid var(--primary-100); border-radius:var(--radius-md); padding:var(--space-3); margin-bottom:var(--space-4); font-size:var(--font-xs); color:var(--primary-dark); text-align:center;">
                        ${aprovacaoMsg[cadastroRole]}
                    </div>

                    <form class="login-form" onsubmit="handleCadastro(event)">
                        <div class="form-group">
                            <label class="form-label">Nome completo</label>
                            <input type="text" class="form-input" id="cadastro-nome" placeholder="Seu nome completo" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label">E-mail</label>
                            <input type="email" class="form-input" id="cadastro-email" placeholder="seu@email.com" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Senha</label>
                            <input type="password" class="form-input" id="cadastro-senha" placeholder="Mínimo 6 caracteres" minlength="6" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Código da Empresa</label>
                            <input type="text" class="form-input" id="cadastro-codigo" placeholder="Ex: FASHION2026" style="text-transform:uppercase;" required>
                            <span style="font-size:10px; color:var(--gray-400); margin-top:4px; display:block;">Solicite o código com seu líder ou social media</span>
                        </div>

                        <div id="cadastro-error" style="display:none; background:var(--danger-light); color:var(--danger-dark); padding:var(--space-3); border-radius:var(--radius-md); font-size:var(--font-sm); text-align:center;"></div>

                        <button type="submit" class="btn btn-primary btn-lg" style="width:100%;">
                            ${Icons.plus}
                            <span>Solicitar Cadastro</span>
                        </button>
                    </form>
                `}

                <div style="text-align:center; margin-top:var(--space-5); padding-top:var(--space-4); border-top:1px solid var(--gray-100);">
                    <p style="font-size:var(--font-sm); color:var(--gray-500);">
                        Já tem uma conta?
                        <a href="#" onclick="voltarSelecaoAcesso()" style="color:var(--primary); font-weight:600; text-decoration:none;">Fazer login</a>
                    </p>
                </div>
            </div>
        </div>
    `;
}

// ---- Handlers ---- (Globalizados acima)

// ---- Handlers ----

window.handleLogin = async function(e) {
    e.preventDefault();
    console.log('🛡️ handleLogin Iniciado');
    const emailInput = document.getElementById('login-email');
    const senhaInput = document.getElementById('login-senha');
    
    if (!emailInput || !senhaInput) {
        console.error('❌ Inputs de login não encontrados no DOM!');
        return;
    }

    const email = emailInput.value.trim().toLowerCase();
    const senha = senhaInput.value.trim();

    const errorDiv = document.getElementById('login-error');
    if (errorDiv) errorDiv.style.display = 'none';

    if (!email || !senha) {
        if (errorDiv) {
            errorDiv.textContent = 'Preencha todos os campos.';
            errorDiv.style.display = 'block';
        }
        return;
    }

    try {
        console.log('📡 Chamando Store.login para:', email);
        const result = await Store.login(email, senha, loginRoleSelecionado);
        if (!result.success) {
            if (errorDiv) {
                errorDiv.textContent = result.error;
                errorDiv.style.display = 'block';
                errorDiv.style.animation = 'fadeIn 0.3s ease';
            }
        } else {
            console.log('✅ Login processado com sucesso!');
            // Oferecer biometria se dispositivo suportar e ainda não houver
            if (window.PublicKeyCredential && !localStorage.getItem('socialflow_biometria')) {
                // Modal nativo assíncrono para perguntar
                setTimeout(async () => {
                    const querBiometria = confirm('✨ Deseja habilitar o Acesso Rápido com Biometria para a próxima vez? (FaceID/TouchID)');
                    if (querBiometria) {
                        await cadastrarBiometria(email, senha);
                    }
                }, 500); // Aguarda o render inicial
            }
        }
    } catch (err) {
        console.error('💥 Erro técnico no handleLogin:', err);
        if (errorDiv) {
            errorDiv.textContent = 'Erro inesperado na autenticação.';
            errorDiv.style.display = 'block';
        }
    }
};

// ---- Subsistema Biométrico (Quick Login Wrapper) ----

function bufToBase64(buf) {
    const bytes = new Uint8Array(buf);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

function base64ToBuf(b64) {
    const binary = atob(b64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
}

window.loginComBiometria = async function() {
    try {
        const payloadStr = localStorage.getItem('socialflow_biometria');
        if (!payloadStr) return;
        const payload = JSON.parse(payloadStr);

        const credentialId = base64ToBuf(payload.credId);
        
        // Chamada nativa ao WebAuthn
        const assertion = await navigator.credentials.get({
            publicKey: {
                challenge: new Uint8Array(32), // Num ambiente real seria gerado pelo server
                allowCredentials: [{
                    type: 'public-key',
                    id: credentialId
                }],
                userVerification: "required",
                timeout: 60000
            }
        });

        if (assertion) {
            console.log("👆 Biometria reconhecida!");
            const senha = atob(payload.p);
            
            // Preenche o form invisivelmente e submete
            document.getElementById('login-email').value = payload.email;
            document.getElementById('login-senha').value = senha;
            
            showToast('Biometria OK! Entrando...', 'success');
            setTimeout(() => {
                const form = document.querySelector('.login-form');
                if (form) form.dispatchEvent(new Event('submit', { cancelable: true }));
                // Fallback manual
                else document.getElementById('login-senha').closest('form').dispatchEvent(new Event('submit', { cancelable: true }));
            }, 300);
        }
    } catch (err) {
        console.error("Biometria falhou ou cancelada", err);
        showToast('Login biométrico cancelado.', 'warning');
    }
};

window.cadastrarBiometria = async function(email, senha) {
    try {
        const userId = new Uint8Array(16);
        crypto.getRandomValues(userId);
        
        const hostname = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
                            ? 'localhost' : window.location.hostname;

        const credential = await navigator.credentials.create({
            publicKey: {
                challenge: new Uint8Array(32),
                rp: { name: "SocialFlow SaaS" },
                user: {
                    id: userId,
                    name: email,
                    displayName: email.split('@')[0]
                },
                pubKeyCredParams: [
                    {type: "public-key", alg: -7}, // ES256
                    {type: "public-key", alg: -257} // RS256
                ],
                authenticatorSelection: { 
                    authenticatorAttachment: "platform", 
                    userVerification: "required" 
                },
                timeout: 60000,
                attestation: "none"
            }
        });
        
        if (credential) {
            localStorage.setItem('socialflow_biometria', JSON.stringify({
                credId: bufToBase64(credential.rawId),
                email: email,
                p: btoa(senha) // Codificado basico pro quick login local
            }));
            showToast('Biometria cadastrada com sucesso! 🚀', 'success');
        }
    } catch (err) {
        console.error("Cadastro biométrico falhou", err);
        showToast('Não foi possível cadastrar a biometria.', 'error');
    }
};

window.handleCadastro = function(e) {
    e.preventDefault();
    console.log('📝 handleCadastro Iniciado');
    const nome = document.getElementById('cadastro-nome').value.trim();
    const email = document.getElementById('cadastro-email').value.trim();
    const senha = document.getElementById('cadastro-senha').value;
    const codigoEl = document.getElementById('cadastro-codigo');
    const codigoEmpresa = codigoEl ? codigoEl.value.trim().toUpperCase() : '';

    const errorDiv = document.getElementById('cadastro-error');
    if (errorDiv) errorDiv.style.display = 'none';

    if (!nome || !email || !senha) {
        if (errorDiv) {
            errorDiv.textContent = 'Preencha todos os campos.';
            errorDiv.style.display = 'block';
        }
        return;
    }

    if (!codigoEmpresa) {
        if (errorDiv) {
            errorDiv.textContent = 'Informe o código da empresa.';
            errorDiv.style.display = 'block';
        }
        return;
    }

    if (senha.length < 6) {
        if (errorDiv) {
            errorDiv.textContent = 'A senha deve ter no mínimo 6 caracteres.';
            errorDiv.style.display = 'block';
        }
        return;
    }

    const result = Store.registrar({ nome, email, senha, role: cadastroRole, codigoEmpresa });
    if (!result.success) {
        if (errorDiv) {
            errorDiv.textContent = result.error;
            errorDiv.style.display = 'block';
        }
        return;
    }

    // Sucesso — mostrar mensagem
    const msg = cadastroRole === 'cliente'
        ? 'Cadastro enviado! Aguardando aprovação do Social Media. ⏳'
        : 'Cadastro enviado! Aguardando aprovação da Liderança. ⏳';
    showToast(msg, 'success');
    loginMode = 'login';
    if (window.App) window.App.render();
};
