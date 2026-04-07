// ====================================
// SOCIALFLOW — Cloudflare R2 Upload Service (v5.0)
// ====================================

const R2Service = {
    /**
     * Realiza o upload de um arquivo diretamente para o Cloudflare R2
     * @param {File} file - O arquivo do input type="file"
     * @param {string} folder - Pasta no bucket (ex: 'artes', 'briefings')
     * @returns {Promise<string>} - A URL pública do arquivo
     */
    async upload(file, folder = 'artes') {
        try {
            console.log(`☁️ Iniciando upload R2: ${file.name}`);

            // 1. Solicitar URL Assinada ao nosso "Backend" (Cloudflare Function)
            // Nota: O endpoint /api/get-signed-url deve estar configurado no Cloudflare Pages
            const response = await fetch('/api/get-signed-url', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    fileName: `${folder}/${Date.now()}-${file.name}`,
                    fileType: file.type
                })
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.message || 'Falha ao obter URL de upload');
            }

            const { uploadUrl, publicUrl } = await response.json();

            // 2. Upload DIRETO do navegador para o R2 usando a URL assinada (PUT)
            const uploadResponse = await fetch(uploadUrl, {
                method: 'PUT',
                headers: {
                    'Content-Type': file.type
                },
                body: file
            });

            if (!uploadResponse.ok) {
                throw new Error('Falha no upload para o Cloudflare R2');
            }

            console.log('✅ Upload R2 Concluído:', publicUrl);
            return publicUrl;
        } catch (error) {
            console.error('💥 Erro no R2Service:', error);
            throw error;
        }
    }
};

window.R2Service = R2Service;
