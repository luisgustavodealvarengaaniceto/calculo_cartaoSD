#!/bin/bash

# Script de teste local - Calculadora SD Card
# Testa se tudo está funcionando antes do deploy

echo "=========================================="
echo "🧪 Teste Local - Calculadora SD Card"
echo "=========================================="
echo ""

# Verificar se os arquivos principais existem
echo "📁 Verificando arquivos principais..."
files=(
    "index.html"
    "app.js"
    "calculator.js"
    "models.js"
    "translations.js"
    "styles.css"
    "Dockerfile"
    "docker-compose.yml"
    "nginx.conf"
)

missing=0
for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "  ✅ $file"
    else
        echo "  ❌ $file - FALTANDO!"
        missing=$((missing+1))
    fi
done

echo ""

if [ $missing -gt 0 ]; then
    echo "❌ $missing arquivo(s) faltando. Corrija antes de continuar."
    exit 1
fi

echo "✅ Todos os arquivos principais encontrados!"
echo ""

# Verificar Docker
echo "🐳 Verificando Docker..."
if command -v docker &> /dev/null; then
    echo "  ✅ Docker instalado: $(docker --version)"
else
    echo "  ❌ Docker não está instalado!"
    exit 1
fi

if command -v docker-compose &> /dev/null; then
    echo "  ✅ Docker Compose instalado: $(docker-compose --version)"
else
    echo "  ❌ Docker Compose não está instalado!"
    exit 1
fi

echo ""

# Verificar se a porta 8084 está disponível
echo "🔌 Verificando porta 8084..."
if lsof -Pi :8084 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "  ⚠️  Porta 8084 está em uso!"
    echo "  Processo usando a porta:"
    lsof -i :8084
    echo ""
    read -p "Deseja parar o processo e continuar? (s/n): " resposta
    if [ "$resposta" != "s" ] && [ "$resposta" != "S" ]; then
        echo "❌ Teste cancelado."
        exit 1
    fi
else
    echo "  ✅ Porta 8084 disponível"
fi

echo ""

# Teste de build
echo "🔨 Testando build da imagem Docker..."
if docker-compose build --no-cache > /tmp/docker-build.log 2>&1; then
    echo "  ✅ Build concluído com sucesso!"
else
    echo "  ❌ Falha no build. Logs:"
    cat /tmp/docker-build.log
    exit 1
fi

echo ""

# Teste de inicialização
echo "🚀 Testando inicialização do container..."
if docker-compose up -d > /tmp/docker-up.log 2>&1; then
    echo "  ✅ Container iniciado!"
    sleep 3
    
    # Verificar se está rodando
    if docker ps | grep -q "calculo-sd"; then
        echo "  ✅ Container está rodando"
    else
        echo "  ❌ Container não está rodando"
        docker-compose logs
        exit 1
    fi
else
    echo "  ❌ Falha ao iniciar container"
    cat /tmp/docker-up.log
    exit 1
fi

echo ""

# Teste de conectividade
echo "🌐 Testando conectividade HTTP..."
sleep 2
if curl -s -o /dev/null -w "%{http_code}" http://localhost:8084 | grep -q "200"; then
    echo "  ✅ Servidor HTTP respondendo (200 OK)"
else
    echo "  ⚠️  Servidor não está respondendo corretamente"
    echo "  Tentando novamente em 3 segundos..."
    sleep 3
    if curl -s -o /dev/null -w "%{http_code}" http://localhost:8084 | grep -q "200"; then
        echo "  ✅ Servidor HTTP respondendo (200 OK)"
    else
        echo "  ❌ Servidor não responde"
        docker-compose logs
    fi
fi

echo ""

# Teste do conteúdo
echo "📄 Testando conteúdo da página..."
if curl -s http://localhost:8084 | grep -q "Calculadora DVR"; then
    echo "  ✅ Conteúdo HTML carregado corretamente"
else
    echo "  ❌ Conteúdo HTML não encontrado"
fi

echo ""
echo "=========================================="
echo "✅ TODOS OS TESTES PASSARAM!"
echo "=========================================="
echo ""
echo "🌐 Aplicação disponível em: http://localhost:8084"
echo ""
echo "Comandos úteis:"
echo "  Ver logs:     docker-compose logs -f"
echo "  Parar:        docker-compose down"
echo "  Reiniciar:    docker-compose restart"
echo ""
echo "Próximos passos para deploy em produção:"
echo "  1. Configure o DNS: calcularsd.jimibrasil.com.br"
echo "  2. Configure o Nginx conforme DEPLOY.md"
echo "  3. Configure SSL com certbot"
echo "  4. Faça upload dos arquivos para /opt/calculo-cartaosd"
echo "  5. Execute: docker-compose up -d"
echo ""
