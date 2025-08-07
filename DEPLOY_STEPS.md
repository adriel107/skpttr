# 🚀 Passos para Deploy no Vercel (Corrigir Erro 404)

## ❌ **Problema Atual:**
- Erro 404 no Vercel
- Configuração incorreta do projeto

## ✅ **Solução Passo a Passo:**

### **1. Preparar o Projeto**

```bash
# 1. Instalar dependências
npm run install:all

# 2. Testar localmente
npm run dev
```

### **2. Configurar Vercel CLI**

```bash
# Instalar Vercel CLI
npm i -g vercel

# Login no Vercel
vercel login
```

### **3. Deploy Manual (Recomendado para Primeira Vez)**

```bash
# Na raiz do projeto
vercel

# Responder às perguntas:
# - Set up and deploy? → Yes
# - Which scope? → Seu usuário
# - Link to existing project? → No
# - What's your project's name? → skpt-track
# - In which directory is your code located? → ./
# - Want to override the settings? → No
```

### **4. Configurar Variáveis de Ambiente**

No Vercel Dashboard:
1. **Settings** → **Environment Variables**
2. **Adicionar as variáveis:**

```env
# Banco de Dados (Supabase)
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres

# JWT
JWT_SECRET=sua_chave_jwt_muito_forte_aqui
JWT_EXPIRES_IN=7d

# Criptografia
ENCRYPTION_KEY=sua_chave_de_32_caracteres_aqui

# APIs
UTMIFY_API_URL=https://api.utmify.com
UTMIFY_API_KEY=sua_chave_utmify
FACEBOOK_ADS_API_URL=https://graph.facebook.com/v18.0
FACEBOOK_ADS_ACCESS_TOKEN=sua_chave_facebook

# CORS
CORS_ORIGIN=https://seu-app.vercel.app

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### **5. Deploy em Produção**

```bash
# Deploy em produção
vercel --prod
```

### **6. Verificar URLs**

Após o deploy, você terá:
- **Frontend**: `https://seu-app.vercel.app`
- **Backend API**: `https://seu-app.vercel.app/api`
- **Health Check**: `https://seu-app.vercel.app/health`
- **Tracking**: `https://seu-app.vercel.app/track`

### **7. Testar Endpoints**

```bash
# Testar health check
curl https://seu-app.vercel.app/health

# Testar API
curl https://seu-app.vercel.app/api/auth/me
```

## 🔧 **Se Ainda Der Erro 404:**

### **Opção A: Deploy Separado**

```bash
# 1. Deploy Backend
cd backend
vercel

# 2. Deploy Frontend
cd ../frontend
vercel
```

### **Opção B: Usar Estrutura Simples**

Criar `api/index.js` na raiz:
```javascript
const app = require('../backend/src/server');
module.exports = app;
```

E atualizar `vercel.json`:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "api/index.js",
      "use": "@vercel/node"
    },
    {
      "src": "frontend/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "build"
      }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/index.js"
    },
    {
      "src": "/(.*)",
      "dest": "frontend/$1"
    }
  ]
}
```

## 📋 **Checklist de Verificação:**

- [ ] ✅ `vercel.json` na raiz
- [ ] ✅ `package.json` na raiz
- [ ] ✅ Dependências instaladas
- [ ] ✅ Variáveis de ambiente configuradas
- [ ] ✅ Banco de dados configurado
- [ ] ✅ Deploy feito com sucesso
- [ ] ✅ Health check funcionando
- [ ] ✅ Frontend carregando
- [ ] ✅ API respondendo

## 🆘 **Se Nada Funcionar:**

1. **Limpar cache:**
```bash
rm -rf .vercel
vercel --force
```

2. **Deploy do zero:**
```bash
vercel --force --prod
```

3. **Verificar logs no Vercel Dashboard**

4. **Contatar suporte do Vercel**

---

**🎯 Próximo passo:** Execute `vercel` na raiz do projeto e siga as instruções! 