// ====================================
// SOCIALFLOW — Supabase Client (Seguro v3.0)
// ====================================

const SUPABASE_URL = 'https://goeufonywhlzifzyehtg.supabase.co';
const SUPABASE_KEY = 'sb_publishable_Kzjfq0S4Wwc-6XOFuoSLkw_-Cpnh6fm';

let supabaseClient = null;

function initSupabase() {
    if (typeof supabase !== 'undefined' && supabase.createClient) {
        // Inicializa com persistência e detecção de auto-login
        supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
            auth: {
                autoRefreshToken: true,
                persistSession: true,
                detectSessionInUrl: true
            }
        });
        console.log('🛡️ Supabase Security Shield Ativo');
        return true;
    }
    return false;
}

const AuthHelper = {
    async login(email, password) {
        const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
        if (error) throw error;
        return data;
    },

    async logout() {
        await supabaseClient.auth.signOut();
    },

    async getUser() {
        const { data: { user } } = await supabaseClient.auth.getUser();
        return user;
    },

    // Simulação/Suporte para MFA (Requer configuração no Dashboard Supabase)
    async challengeMFA(factorId) {
        const { data, error } = await supabaseClient.auth.mfa.challenge({ factorId });
        if (error) throw error;
        return data;
    },

    async verifyMFA(challengeId, code) {
        const { data, error } = await supabaseClient.auth.mfa.verify({ challengeId, code });
        if (error) throw error;
        return data;
    }
};

window.initSupabase = initSupabase;
window.getSupabase = () => supabaseClient;
window.AuthHelper = AuthHelper;
