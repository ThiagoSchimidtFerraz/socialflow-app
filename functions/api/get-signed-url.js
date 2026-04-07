import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

/**
 * SOCIALFLOW — Cloudflare Pages Function: get-signed-url (v5.0)
 * Esta função gera uma URL assinada temporária para upload direto para o R2.
 * Segurança: As chaves de acesso NUNCA vazam para o navegador.
 */

export async function onRequestPost({ request, env }) {
    try {
        const { fileName, fileType } = await request.json();

        // 1. Configurar o Cliente S3 para o Cloudflare R2 
        // Nota: Estas variáveis (R2_ACCOUNT_ID, R2_ACCESS_KEY, R2_SECRET_KEY) 
        // devem ser configuradas no painel da Cloudflare -> Settings -> Environment Variables
        const s3 = new S3Client({
            region: "auto",
            endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
            credentials: {
                accessKeyId: env.R2_ACCESS_KEY,
                secretAccessKey: env.R2_SECRET_KEY,
            },
        });

        // 2. Preparar o comando de upload (PUT)
        const bucketName = env.R2_BUCKET_NAME || 'socialflow-assets';
        const command = new PutObjectCommand({
            Bucket: bucketName,
            Key: fileName,
            ContentType: fileType,
        });

        // 3. Gerar a URL assinada (Expira em 1 hora)
        const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });

        // 4. URL pública para visualização (CDN)
        // Se você não tiver um domínio customizado, a Cloudflare fornece um pub-xxxx.r2.dev
        const publicUrl = `${env.R2_PUBLIC_URL}/${fileName}`;

        return new Response(JSON.stringify({ uploadUrl, publicUrl }), {
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error) {
        console.error('💥 Erro ao gerar URL assinada:', error);
        return new Response(JSON.stringify({ message: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
