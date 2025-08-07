# Deploy SKPT Track no Vercel + GitHub + Supabase

## 🚀 Configuração Completa

### 1. **Preparação do Projeto**

#### Estrutura para Vercel
```
skpt-track/
├── frontend/          # React App
├── backend/           # API Routes
├── vercel.json        # Configuração Vercel
└── package.json       # Root package
```

#### Criar `vercel.json` na raiz:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "backend/src/server.js",
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
      "dest": "backend/src/server.js"
    },
    {
      "src": "/(.*)",
      "dest": "frontend/$1"
    }
  ]
}
```

### 2. **Configuração do Banco Supabase**

#### Passo a Passo:
1. **Criar conta em supabase.com**
2. **Criar novo projeto**
3. **Pegar connection string**
4. **Configurar variáveis de ambiente**

#### Connection String Supabase:
```
postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres
```

### 3. **Deploy no Vercel**

#### Opção A: Deploy Manual
```bash
# Instalar Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Deploy em produção
vercel --prod
```

#### Opção B: Deploy Automático via GitHub
1. **Conectar GitHub ao Vercel**
2. **Importar repositório**
3. **Configurar variáveis de ambiente**
4. **Deploy automático a cada push**

### 4. **Configuração de Variáveis de Ambiente**

#### No Vercel Dashboard:
```env
# Banco de Dados
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres

# JWT
JWT_SECRET=your_very_strong_jwt_secret_key_here
JWT_EXPIRES_IN=7d

# Criptografia
ENCRYPTION_KEY=your_32_character_encryption_key_here

# APIs
UTMIFY_API_URL=https://api.utmify.com
UTMIFY_API_KEY=your_utmify_api_key
FACEBOOK_ADS_API_URL=https://graph.facebook.com/v18.0
FACEBOOK_ADS_ACCESS_TOKEN=your_facebook_access_token

# CORS
CORS_ORIGIN=https://your-app.vercel.app

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 5. **Configuração do Frontend**

#### Atualizar `frontend/src/services/api.js`:
```javascript
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'https://your-backend.vercel.app/api',
  timeout: 10000,
});
```

#### Variáveis do Frontend:
```env
REACT_APP_API_URL=https://your-backend.vercel.app/api
REACT_APP_ENVIRONMENT=production
```

### 6. **Scripts de Deploy**

#### Criar `scripts/deploy-vercel.sh`:
```bash
#!/bin/bash

echo "🚀 Deployando SKPT Track no Vercel..."

# Gerar chaves seguras
echo "🔐 Gerando chaves de segurança..."
JWT_SECRET=$(openssl rand -base64 32)
ENCRYPTION_KEY=$(openssl rand -base64 24)

# Configurar variáveis
echo "⚙️ Configurando variáveis de ambiente..."
vercel env add JWT_SECRET $JWT_SECRET
vercel env add ENCRYPTION_KEY $ENCRYPTION_KEY

# Deploy
echo "📦 Fazendo deploy..."
vercel --prod

echo "✅ Deploy concluído!"
echo "🌐 URL: https://your-app.vercel.app"
```

### 7. **GitHub Actions para Deploy Automático**

#### Criar `.github/workflows/deploy.yml`:
```yaml
name: Deploy to Vercel

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: |
          cd backend && npm install
          cd ../frontend && npm install
          
      - name: Build frontend
        run: |
          cd frontend
          npm run build
          
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          working-directory: ./
```

### 8. **Configuração de Domínio**

#### Subdomínios Recomendados:
```
api.skpttrack.com -> Backend API
app.skpttrack.com -> Frontend App
track.skpttrack.com -> Tracking Endpoint
```

#### Configurar no Vercel:
1. **Adicionar domínio no Vercel Dashboard**
2. **Configurar DNS records**
3. **Configurar SSL automático**

### 9. **Monitoramento e Logs**

#### Vercel Analytics:
```javascript
// Adicionar em frontend/src/index.js
import { Analytics } from '@vercel/analytics/react';

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <App />
          <Analytics />
        </ThemeProvider>
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);
```

### 10. **Troubleshooting**

#### Problemas Comuns:

**1. Erro de CORS:**
```javascript
// Verificar em backend/src/server.js
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'https://your-app.vercel.app',
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

**3. Erro de Build:**
```bash
# Limpar cache
rm -rf .vercel
vercel --force
```

### 11. **Custos Vercel**

#### Plano Gratuito:
- **Deploy**: Ilimitado
- **Bandwidth**: 100GB/mês
- **Serverless Functions**: 100GB-Hrs/mês
- **Domínios**: Ilimitados
- **SSL**: Incluído

#### Plano Pro ($20/mês):
- **Bandwidth**: 1TB/mês
- **Serverless Functions**: 1000GB-Hrs/mês
- **Analytics**: Incluído
- **Edge Functions**: Incluído

### 12. **Passos Finais**

1. **✅ Configurar Supabase**
2. **✅ Conectar GitHub ao Vercel**
3. **✅ Configurar variáveis de ambiente**
4. **✅ Fazer deploy de teste**
5. **✅ Configurar domínio**
6. **✅ Testar todas as funcionalidades**
7. **✅ Configurar monitoramento**

---

**🎉 Resultado Final:**
- **Frontend**: https://your-app.vercel.app
- **Backend**: https://your-app.vercel.app/api
- **Tracking**: https://your-app.vercel.app/track
- **Custo**: $0/mês (plano gratuito)

**Próximo passo**: Configurar o Supabase e fazer o primeiro deploy! 