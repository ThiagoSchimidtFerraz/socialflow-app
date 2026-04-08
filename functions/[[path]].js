/**
 * SOCIALFLOW — Roteador SPA Inteligente (v5.1)
 * Este arquivo garante que rotas como /dashboard, /master, e /portal 
 * funcionem perfeitamente sem erros 404 ou loops infinitos na Cloudflare.
 */

export async function onRequest({ request, next, env }) {
    const url = new URL(request.url);
    const path = url.pathname;

    // 1. Deixar chamadas de API (como o R2) passarem direto
    if (path.startsWith('/api/')) {
        return next();
    }

    // 2. Se for um arquivo real (com extensão .js, .css, .png, etc.), tenta carregar
    if (path.includes('.') && !path.endsWith('.html')) {
        return next();
    }

    // 3. Roteamento Especial (Smart Map)
    // Isso substitui o arquivo _redirects com 100% de confiabilidade
    if (path === '/master') {
        return env.ASSETS.fetch(new URL('/master.html', request.url));
    }
    if (path === '/portal' || path.startsWith('/portal/')) {
        return env.ASSETS.fetch(new URL('/portal-cliente.html', request.url));
    }

    // 4. Fallback Global para o Dashboard/SPA (Qualquer outra rota de texto)
    // Se a página não existir, entrega o index.html em vez de dar 404
    const response = await next();
    if (response.status === 404) {
        return env.ASSETS.fetch(new URL('/index.html', request.url));
    }

    return response;
}
