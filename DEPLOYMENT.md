# Guia de Deploy - SKPT Track

## Opções de Hospedagem

### 1. **Vercel (Recomendado para Frontend)**
**Vantagens:**
- Deploy automático do GitHub
- SSL gratuito
- CDN global
- Integração perfeita com React
- Domínio personalizado gratuito

**Como fazer:**
```bash
# Instalar Vercel CLI
npm i -g vercel

# No diretório frontend
cd frontend
vercel

# Ou conectar com GitHub para deploy automático
```

### 2. **Vercel (Backend + Frontend)**
**Vantagens:**
- Deploy automático do GitHub
- SSL gratuito
- CDN global
- Suporte completo para Node.js
- Domínio personalizado gratuito
- Serverless Functions para API
- Integração perfeita com React

**Como fazer:**
```bash
# Instalar Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy backend (API routes)
cd backend
vercel

# Deploy frontend
cd ../frontend
vercel

# Ou conectar com GitHub para deploy automático
```

### 3. **Heroku (Alternativa Completa)**
**Vantagens:**
- Suporte completo para Node.js
- PostgreSQL add-on
- Deploy automático
- SSL gratuito

**Como fazer:**
```bash
# Instalar Heroku CLI
# Criar app
heroku create skpt-track-backend

# Adicionar PostgreSQL
heroku addons:create heroku-postgresql:mini

# Configurar variáveis
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your_secret_key
heroku config:set ENCRYPTION_KEY=your_32_char_key

# Deploy
git push heroku main
```

### 4. **DigitalOcean (VPS Completo)**
**Vantagens:**
- Controle total
- Mais econômico para projetos grandes
- Escalabilidade

**Como fazer:**
```bash
# Criar droplet Ubuntu
# Conectar via SSH
ssh root@your_server_ip

# Instalar Node.js, PostgreSQL, Nginx
# Configurar PM2 para Node.js
npm install -g pm2
pm2 start src/server.js
pm2 startup
pm2 save
```

## Configuração de Banco de Dados

### PostgreSQL na Nuvem

**1. Supabase (Recomendado - Gratuito):**
- Criar conta em supabase.com
- Criar novo projeto
- Usar connection string fornecida
- Interface web para gerenciar dados

**2. Neon (PostgreSQL Serverless):**
- Criar conta em neon.tech
- Criar projeto
- Usar connection string
- Performance otimizada

**3. PlanetScale (MySQL - Alternativa):**
- Criar conta em planetscale.com
- Criar database
- Usar connection string
- Interface web intuitiva

**4. Railway PostgreSQL (Pago):**
```bash
# Instalar Railway CLI
npm i -g @railway/cli

# Login
railway login

# Conectar ao banco
railway connect

# Executar migrações
npm run migrate
```

## Variáveis de Ambiente para Produção

### Backend (.env)
```env
# Configurações do Servidor
PORT=3001
NODE_ENV=production

# Configurações do Banco de Dados
DB_HOST=your_db_host
DB_PORT=5432
DB_NAME=skpt_track
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_URL=postgresql://user:password@host:5432/database

# JWT Secret (GERE UMA CHAVE FORTE!)
JWT_SECRET=your_very_strong_jwt_secret_key_here
JWT_EXPIRES_IN=7d

# Criptografia (32 caracteres!)
ENCRYPTION_KEY=your_32_character_encryption_key_here

# APIs Externas
UTMIFY_API_URL=https://api.utmify.com
UTMIFY_API_KEY=your_utmify_api_key
FACEBOOK_ADS_API_URL=https://graph.facebook.com/v18.0
FACEBOOK_ADS_ACCESS_TOKEN=your_facebook_access_token

# CORS
CORS_ORIGIN=https://your-frontend-domain.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Frontend (.env)
```env
REACT_APP_API_URL=https://your-backend-domain.com/api
REACT_APP_ENVIRONMENT=production
```

## Scripts de Deploy

### 1. Deploy Automático com GitHub Actions

Criar `.github/workflows/deploy.yml`:
```yaml
name: Deploy SKPT Track

on:
  push:
    branches: [ main ]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - run: npm run migrate
      # Adicionar deploy para Railway/Heroku

  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      # Adicionar deploy para Vercel
```

### 2. Script de Deploy Manual

Criar `scripts/deploy.sh`:
```bash
#!/bin/bash

echo "🚀 Iniciando deploy do SKPT Track..."

# Backend
echo "📦 Deployando backend..."
cd backend
npm install
npm run build
# Adicionar comando de deploy específico

# Frontend
echo "📦 Deployando frontend..."
cd ../frontend
npm install
npm run build
# Adicionar comando de deploy específico

echo "✅ Deploy concluído!"
```

## Configuração de Domínio

### 1. Domínio Personalizado
- Comprar domínio (ex: skpttrack.com)
- Configurar DNS para apontar para os serviços
- Configurar SSL/HTTPS

### 2. Subdomínios Recomendados
```
api.skpttrack.com -> Backend
app.skpttrack.com -> Frontend
track.skpttrack.com -> Endpoint de rastreamento
```

## Monitoramento e Logs

### 1. Logs de Aplicação
```javascript
// Adicionar em server.js
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

### 2. Monitoramento de Performance
- **Sentry**: Para tracking de erros
- **New Relic**: Para performance
- **Uptime Robot**: Para monitoramento de uptime

## Segurança em Produção

### 1. Configurações de Segurança
```javascript
// Adicionar em server.js
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
    },
  },
}));

// Rate limiting mais rigoroso
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // limite por IP
  message: 'Muitas requisições deste IP'
});
```

### 2. Backup do Banco de Dados
```bash
# Script de backup automático
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql
```

## Custos Estimados

### Opção Econômica (Início)
- **Vercel**: $0/mês (frontend + backend)
- **Supabase**: $0/mês (banco de dados)
- **Domínio**: $10/ano
- **Total**: ~$10/ano

### Opção Profissional
- **Vercel Pro**: $20/mês
- **Supabase Pro**: $25/mês
- **Domínio**: $10/ano
- **Monitoramento**: $10/mês
- **Total**: ~$65/mês

## Passos para Deploy

### 1. Preparação
```bash
# 1. Testar localmente
npm run test
npm run build

# 2. Configurar variáveis de ambiente
# 3. Configurar banco de dados
# 4. Testar conexões
```

### 2. Deploy Backend
```bash
# Vercel (API Routes)
cd backend
vercel

# Ou deploy automático via GitHub
# Conectar repositório no Vercel Dashboard
```

### 3. Deploy Frontend
```bash
# Vercel
vercel --prod

# Netlify
netlify deploy --prod
```

### 4. Configuração Final
- Configurar CORS
- Testar endpoints
- Configurar monitoramento
- Configurar backup

## Troubleshooting

### Problemas Comuns

**1. Erro de CORS:**
```javascript
// Verificar configuração CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true
}));
```

**2. Erro de Conexão com Banco:**
```bash
# Verificar connection string
echo $DATABASE_URL

# Testar conexão
psql $DATABASE_URL -c "SELECT 1;"
```

**3. Erro de Build Frontend:**
```bash
# Limpar cache
rm -rf node_modules package-lock.json
npm install
npm run build
```

## Próximos Passos

1. **Escolher plataforma de hospedagem**
2. **Configurar banco de dados**
3. **Configurar variáveis de ambiente**
4. **Fazer deploy de teste**
5. **Configurar domínio e SSL**
6. **Configurar monitoramento**
7. **Testar todas as funcionalidades**

## Suporte

- **Documentação**: Cada plataforma tem documentação detalhada
- **Comunidade**: Stack Overflow, GitHub Issues
- **Suporte**: Contatar suporte das plataformas escolhidas

---

**Recomendação Final:**
Para começar, use **Vercel + Supabase** - é a combinação mais simples e econômica para projetos como o SKPT Track. Vercel para frontend e backend, Supabase para banco de dados. 