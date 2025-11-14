#!/bin/bash

# Script de Deploy - Calculadora SD Card Jimi IoT
# Uso: ./deploy.sh [build|start|stop|restart|logs|update]

set -e

PROJECT_NAME="calculo-cartaosd"
CONTAINER_NAME="calculo-sd"
COMPOSE_FILE="docker-compose.yml"

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para logs coloridos
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar se Docker está instalado
check_docker() {
    if ! command -v docker &> /dev/null; then
        log_error "Docker não está instalado!"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose não está instalado!"
        exit 1
    fi
    
    log_success "Docker e Docker Compose estão instalados"
}

# Build da imagem
build() {
    log_info "Iniciando build da imagem Docker..."
    docker-compose build --no-cache
    log_success "Build concluído com sucesso!"
}

# Iniciar container
start() {
    log_info "Iniciando container..."
    docker-compose up -d
    sleep 3
    if docker ps | grep -q "$CONTAINER_NAME"; then
        log_success "Container iniciado com sucesso!"
        log_info "Aplicação disponível em: http://localhost:8084"
    else
        log_error "Falha ao iniciar o container"
        docker-compose logs
        exit 1
    fi
}

# Parar container
stop() {
    log_info "Parando container..."
    docker-compose down
    log_success "Container parado com sucesso!"
}

# Reiniciar container
restart() {
    log_info "Reiniciando container..."
    docker-compose restart
    log_success "Container reiniciado com sucesso!"
}

# Ver logs
logs() {
    log_info "Mostrando logs do container (Ctrl+C para sair)..."
    docker-compose logs -f
}

# Status
status() {
    log_info "Status dos containers:"
    docker-compose ps
    echo ""
    if docker ps | grep -q "$CONTAINER_NAME"; then
        log_success "Container está rodando"
        echo ""
        log_info "Health check:"
        docker inspect --format='{{.State.Health.Status}}' "$CONTAINER_NAME" 2>/dev/null || echo "N/A"
    else
        log_warning "Container não está rodando"
    fi
}

# Atualizar (pull + build + restart)
update() {
    log_info "Atualizando aplicação..."
    
    if [ -d .git ]; then
        log_info "Atualizando código do repositório..."
        git pull
    else
        log_warning "Não é um repositório Git, pulando git pull"
    fi
    
    build
    stop
    start
    
    log_success "Atualização concluída!"
}

# Limpar recursos Docker não utilizados
cleanup() {
    log_info "Limpando recursos Docker não utilizados..."
    docker system prune -f
    log_success "Limpeza concluída!"
}

# Backup dos arquivos
backup() {
    BACKUP_DIR="backups"
    TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
    BACKUP_FILE="${BACKUP_DIR}/backup_${TIMESTAMP}.tar.gz"
    
    log_info "Criando backup..."
    mkdir -p "$BACKUP_DIR"
    
    tar -czf "$BACKUP_FILE" \
        --exclude='node_modules' \
        --exclude='.git' \
        --exclude='backups' \
        --exclude='*.log' \
        *.html *.js *.css *.md *.json Dockerfile docker-compose.yml nginx.conf 2>/dev/null
    
    log_success "Backup criado: $BACKUP_FILE"
}

# Menu de ajuda
show_help() {
    cat << EOF
${BLUE}Calculadora SD Card Jimi IoT - Script de Deploy${NC}

${YELLOW}Uso:${NC}
    ./deploy.sh [comando]

${YELLOW}Comandos disponíveis:${NC}
    ${GREEN}build${NC}       - Build da imagem Docker
    ${GREEN}start${NC}       - Iniciar o container
    ${GREEN}stop${NC}        - Parar o container
    ${GREEN}restart${NC}     - Reiniciar o container
    ${GREEN}logs${NC}        - Ver logs do container (tempo real)
    ${GREEN}status${NC}      - Ver status do container
    ${GREEN}update${NC}      - Atualizar (git pull + build + restart)
    ${GREEN}cleanup${NC}     - Limpar recursos Docker não utilizados
    ${GREEN}backup${NC}      - Criar backup dos arquivos
    ${GREEN}help${NC}        - Mostrar esta ajuda

${YELLOW}Exemplos:${NC}
    ./deploy.sh build
    ./deploy.sh start
    ./deploy.sh logs
    ./deploy.sh update

${YELLOW}Deploy inicial:${NC}
    ./deploy.sh build
    ./deploy.sh start
    ./deploy.sh status

EOF
}

# Menu principal
case "${1:-help}" in
    build)
        check_docker
        build
        ;;
    start)
        check_docker
        start
        ;;
    stop)
        check_docker
        stop
        ;;
    restart)
        check_docker
        restart
        ;;
    logs)
        check_docker
        logs
        ;;
    status)
        check_docker
        status
        ;;
    update)
        check_docker
        update
        ;;
    cleanup)
        check_docker
        cleanup
        ;;
    backup)
        backup
        ;;
    help|*)
        show_help
        ;;
esac
