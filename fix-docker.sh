#!/bin/bash

# Script de correção de erros comuns do Docker
# Para Ubuntu Server

echo "🔧 Corrigindo problema de iptables do Docker..."

# Método 1: Reiniciar Docker
echo "1️⃣ Tentando reiniciar o Docker..."
sudo systemctl restart docker
sleep 3

# Método 2: Limpar redes antigas
echo "2️⃣ Limpando redes Docker antigas..."
docker network prune -f

# Método 3: Recarregar iptables
echo "3️⃣ Recarregando iptables..."
sudo iptables -t filter -F DOCKER-FORWARD 2>/dev/null || true
sudo iptables -t nat -F DOCKER 2>/dev/null || true

# Reiniciar Docker novamente
echo "4️⃣ Reiniciando Docker novamente..."
sudo systemctl restart docker
sleep 3

echo "✅ Correções aplicadas!"
echo ""
echo "Agora tente novamente:"
echo "  docker compose up -d"
