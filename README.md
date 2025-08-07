# SKPT Track - Plataforma de Rastreamento de Campanhas

## Descrição do Projeto

SKPT Track é uma plataforma que permite aos usuários gerar links de rastreamento personalizados para suas campanhas de Facebook Ads. Quando uma venda ocorre, o valor da venda e a campanha responsável são enviados automaticamente para a plataforma UTMify, marcando a venda como 100% concluída.

## Funcionalidades Principais

### 1. Cadastro e Autenticação
- Sistema de registro e login de usuários
- Armazenamento seguro de ID do bot e token de autenticação
- Criptografia de dados sensíveis

### 2. Geração de Links de Rastreamento
- Criação de links únicos baseados no ID do bot e token
- Formato: `https://skptrack.com/track?bot_id={BOT_ID}&token={TOKEN}&campaign={CAMPAIGN_ID}`
- Interface intuitiva para gerenciar links

### 3. Integração com Facebook Ads
- Captura de dados de vendas através dos links de rastreamento
- Rastreamento de conversões e eventos de vendas
- Integração com API do Facebook Ads

### 4. Integração com UTMify
- Envio automático de dados de vendas para UTMify
- Inclusão de valor da venda, ID da campanha, status (100%)
- Marcação automática de vendas como concluídas

### 5. Relatórios e Analytics
- Dashboard com métricas de campanhas
- Relatórios detalhados de vendas e conversões
- Status de vendas em tempo real

## Arquitetura Técnica

### Backend
- **Framework**: Node.js com Express
- **Banco de Dados**: PostgreSQL
- **Autenticação**: JWT (JSON Web Tokens)
- **Criptografia**: bcrypt para senhas, crypto para tokens

### Frontend
- **Framework**: React com TypeScript
- **UI Library**: Material-UI
- **Estado**: Redux Toolkit
- **Roteamento**: React Router

### APIs e Integrações
- **Facebook Ads API**: Para rastreamento de conversões
- **UTMify API**: Para envio de dados de vendas
- **RESTful APIs**: Para comunicação entre frontend e backend

## Estrutura do Projeto

```
skpt-track/
├── backend/                 # API Node.js/Express
├── frontend/               # Aplicação React
├── database/              # Scripts de banco de dados
├── docs/                  # Documentação
└── docker/               # Configurações Docker
```

## Instalação e Configuração

### Pré-requisitos
- Node.js 18+
- PostgreSQL 14+
- Docker (opcional)

### Configuração do Ambiente

1. **Clone o repositório**
```bash
git clone <repository-url>
cd skpt-track
```

2. **Instale as dependências**
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

3. **Configure o banco de dados**
```bash
# Execute os scripts de migração
cd database
npm run migrate
```

4. **Configure as variáveis de ambiente**
```bash
# Copie o arquivo de exemplo
cp .env.example .env
# Edite as variáveis necessárias
```

5. **Inicie a aplicação**
```bash
# Backend
cd backend
npm run dev

# Frontend (em outro terminal)
cd frontend
npm start
```

## Segurança

- Criptografia de senhas com bcrypt
- Tokens JWT para autenticação
- Armazenamento seguro de IDs de bot e tokens
- Validação de entrada em todas as APIs
- Rate limiting para prevenir abuso
- HTTPS obrigatório em produção

## APIs Principais

### Autenticação
- `POST /api/auth/register` - Registro de usuário
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout

### Links de Rastreamento
- `POST /api/tracking-links` - Criar novo link
- `GET /api/tracking-links` - Listar links do usuário
- `DELETE /api/tracking-links/:id` - Deletar link

### Rastreamento
- `GET /track` - Endpoint de rastreamento
- `POST /api/tracking/event` - Registrar evento de venda

### Relatórios
- `GET /api/reports/campaigns` - Relatórios de campanhas
- `GET /api/reports/sales` - Relatórios de vendas

## Integração com UTMify

A plataforma envia automaticamente os seguintes dados para o UTMify:

```json
{
  "bot_id": "string",
  "sale_value": "number",
  "campaign_id": "string",
  "status": "100%",
  "timestamp": "ISO 8601",
  "user_token": "string"
}
```

## Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## Suporte

Para suporte, envie um email para suporte@skpttrack.com ou abra uma issue no GitHub. 