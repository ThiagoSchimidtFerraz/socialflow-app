import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export default async function handler(req, res) {
  // Configuração CORS (Permite a requisição do front-end)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { fileName, fileType } = req.body;

  if (!fileName || !fileType) {
    return res.status(400).json({ error: 'Faltam dados: fileName ou fileType' });
  }

  // Variáveis de Ambiente configuradas no painel da Vercel
  const ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
  const ACCESS_KEY = process.env.R2_ACCESS_KEY;
  const SECRET_KEY = process.env.R2_SECRET_KEY;
  const BUCKET_NAME = process.env.R2_BUCKET_NAME || 'socialflow-assets';
  const PUBLIC_URL = process.env.R2_PUBLIC_URL; // ex: https://pub-xyz.r2.dev

  if (!ACCOUNT_ID || !ACCESS_KEY || !SECRET_KEY) {
      console.error("R2 Missing Configuration in Environment Variables");
      return res.status(500).json({ error: 'Configuração R2 ausente no servidor Vercel' });
  }

  const S3 = new S3Client({
    region: 'auto',
    endpoint: `https://${ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: ACCESS_KEY,
      secretAccessKey: SECRET_KEY,
    },
  });

  const uniqueFileName = `${Date.now()}-${fileName.replace(/\s+/g, '-')}`;
  
  try {
    const command = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: uniqueFileName,
        ContentType: fileType,
    });

    // Gera um link de upload temporário (URL Assinada), válido por 5 minutos
    const signedUrl = await getSignedUrl(S3, command, { expiresIn: 300 });
    
    res.status(200).json({
        uploadUrl: signedUrl,
        fileUrl: `${PUBLIC_URL}/${uniqueFileName}`
    });
  } catch (error) {
    console.error('Erro ao gerar URL assinada:', error);
    res.status(500).json({ error: 'Falha ao conectar om o servidor R2' });
  }
}
