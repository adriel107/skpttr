#!/bin/bash

# Script de Deploy Automatizado - SKPT Track
# Uso: ./scripts/deploy.sh [backend|frontend|all]

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para log
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERRO]${NC} $1"
}

success() {
    echo -e "${GREEN}[SUCESSO]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[AVISO]${NC} $1"
}

# Verificar se está no diretório raiz do projeto
if [ ! -f "README.md" ]; then
    error "Execute este script no diretório raiz do projeto"
    exit 1
fi

# Função para deploy do backend
deploy_backend() {
    log "🚀 Iniciando deploy do backend..."
    
    cd backend
    
    # Verificar se node_modules existe
    if [ ! -d "node_modules" ]; then
        log "📦 Instalando dependências do backend..."
        npm install
    fi
    
    # Verificar se .env existe
    if [ ! -f ".env" ]; then
        error "Arquivo .env não encontrado no backend!"
        warning "Crie um arquivo .env baseado no .env.example"
        exit 1
    fi
    
    # Testar build
    log "🔨 Testando build do backend..."
    npm run build || {
        error "Erro no build do backend"
        exit 1
    }
    
    # Verificar se Railway CLI está instalado
    if ! command -v railway &> /dev/null; then
        warning "Railway CLI não encontrado. Instalando..."
        npm install -g @railway/cli
    fi
    
    # Deploy para Railway
    log "🚂 Fazendo deploy para Railway..."
    railway up --detach || {
        error "Erro no deploy para Railway"
        exit 1
    }
    
    success "Backend deployado com sucesso!"
    cd ..
}

# Função para deploy do frontend
deploy_frontend() {
    log "🚀 Iniciando deploy do frontend..."
    
    cd frontend
    
    # Verificar se node_modules existe
    if [ ! -d "node_modules" ]; then
        log "📦 Instalando dependências do frontend..."
        npm install
    fi
    
    # Verificar se .env existe
    if [ ! -f ".env" ]; then
        warning "Arquivo .env não encontrado no frontend. Criando baseado no exemplo..."
        cp .env.example .env 2>/dev/null || {
            error "Arquivo .env.example não encontrado!"
            exit 1
        }
    fi
    
    # Testar build
    log "🔨 Testando build do frontend..."
    npm run build || {
        error "Erro no build do frontend"
        exit 1
    }
    
    # Verificar se Vercel CLI está instalado
    if ! command -v vercel &> /dev/null; then
        warning "Vercel CLI não encontrado. Instalando..."
        npm install -g vercel
    fi
    
    # Deploy para Vercel
    log "⚡ Fazendo deploy para Vercel..."
    vercel --prod --yes || {
        error "Erro no deploy para Vercel"
        exit 1
    }
    
    success "Frontend deployado com sucesso!"
    cd ..
}

# Função para deploy completo
deploy_all() {
    log "🚀 Iniciando deploy completo do SKPT Track..."
    
    # Deploy backend primeiro
    deploy_backend
    
    # Aguardar um pouco para o backend estar disponível
    log "⏳ Aguardando backend estar disponível..."
    sleep 10
    
    # Deploy frontend
    deploy_frontend
    
    success "🎉 Deploy completo realizado com sucesso!"
}

# Função para verificar status
check_status() {
    log "🔍 Verificando status dos serviços..."
    
    # Verificar Railway
    if command -v railway &> /dev/null; then
        log "📊 Status do Railway:"
        railway status 2>/dev/null || warning "Não foi possível verificar status do Railway"
    fi
    
    # Verificar Vercel
    if command -v vercel &> /dev/null; then
        log "📊 Status do Vercel:"
        vercel ls 2>/dev/null || warning "Não foi possível verificar status do Vercel"
    fi
}

# Função para mostrar ajuda
show_help() {
    echo "Uso: $0 [OPÇÃO]"
    echo ""
    echo "Opções:"
    echo "  backend    - Deploy apenas do backend (Railway)"
    echo "  frontend   - Deploy apenas do frontend (Vercel)"
    echo "  all        - Deploy completo (backend + frontend)"
    echo "  status     - Verificar status dos serviços"
    echo "  help       - Mostrar esta ajuda"
    echo ""
    echo "Exemplos:"
    echo "  $0 backend"
    echo "  $0 frontend"
    echo "  $0 all"
    echo "  $0 status"
}

# Verificar argumentos
case "${1:-all}" in
    "backend")
        deploy_backend
        ;;
    "frontend")
        deploy_frontend
        ;;
    "all")
        deploy_all
        ;;
    "status")
        check_status
        ;;
    "help"|"-h"|"--help")
        show_help
        ;;
    *)
        error "Opção inválida: $1"
        show_help
        exit 1
        ;;
esac

# Verificar se há erros
if [ $? -eq 0 ]; then
    success "✅ Deploy concluído com sucesso!"
    log "🌐 URLs dos serviços:"
    log "   Backend: https://your-app.railway.app"
    log "   Frontend: https://your-app.vercel.app"
    log "   Tracking: https://your-app.railway.app/track"
else
    error "❌ Deploy falhou!"
    exit 1
fi 