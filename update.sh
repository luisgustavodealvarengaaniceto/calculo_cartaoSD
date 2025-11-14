#!/bin/bash

# Script de Atualização Rápida
# Atualiza o código e reinicia o container

echo "🔄 Atualizando Calculadora SD Card..."

# 1. Ir para o diretório
cd ~/calculo_cartaoSD || exit 1

# 2. Parar container atual
echo "⏸️  Parando container..."
docker compose down

# 3. Atualizar código
echo "📥 Baixando atualizações..."
git pull

# 4. Rebuild da imagem
echo "🔨 Reconstruindo imagem..."
docker compose build --no-cache

# 5. Iniciar container
echo "🚀 Iniciando container..."
docker compose up -d

# 6. Aguardar inicialização
echo "⏳ Aguardando inicialização..."
sleep 5

# 7. Verificar status
echo ""
echo "📊 Status do container:"
docker ps | grep calculo-sd

echo ""
echo "📝 Últimas linhas do log:"
docker logs --tail 20 calculo-sd

echo ""
echo "✅ Atualização concluída!"
echo ""
echo "🌐 Testando conectividade..."
if curl -s -o /dev/null -w "%{http_code}" http://localhost:8084 | grep -q "200"; then
    echo "   ✅ Servidor respondendo corretamente"
    echo "   🔗 Acesse: http://calcularsd.jimibrasil.com.br"
else
    echo "   ⚠️  Servidor não está respondendo"
    echo "   Execute: docker logs calculo-sd"
fi
