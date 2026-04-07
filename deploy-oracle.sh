#!/bin/bash

# ====================================
# SOCIALFLOW — Deploy Oracle Cloud v4.5
# ====================================

# 1. Parar servidor temporariamente e limpar cache
echo "🚀 Iniciando Deploy para Oracle Cloud..."
sudo git pull origin main

# 2. Copiar a nova configuração do Nginx (se houver)
sudo cp nginx.conf /etc/nginx/sites-available/socialflow
sudo ln -sf /etc/nginx/sites-available/socialflow /etc/nginx/sites-enabled/

# 3. Reiniciar Nginx
echo "⚙️ Configurando Nginx e reiniciando..."
sudo nginx -t && sudo systemctl reload nginx

# 4. Sucesso!
echo "✅ Deploy Concluído! Sistema Online no IP da Oracle com 10TB de Banda Grátis."
