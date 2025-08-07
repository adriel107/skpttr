const { Pool } = require('pg');

// Configuração do pool de conexões
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'skpt_track',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  max: 20, // Máximo de conexões no pool
  idleTimeoutMillis: 30000, // Tempo limite para conexões ociosas
  connectionTimeoutMillis: 2000, // Tempo limite para estabelecer conexão
});

// Função para conectar ao banco de dados
async function connectDatabase() {
  try {
    const client = await pool.connect();
    console.log('✅ Conectado ao PostgreSQL');
    client.release();
    
    // Verificar se as tabelas existem
    await checkTables();
  } catch (error) {
    console.error('❌ Erro ao conectar ao banco de dados:', error);
    throw error;
  }
}

// Verificar se as tabelas necessárias existem
async function checkTables() {
  try {
    const client = await pool.connect();
    
    // Verificar se a tabela users existe
    const usersTable = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      );
    `);
    
    if (!usersTable.rows[0].exists) {
      console.log('📋 Criando tabelas...');
      await createTables(client);
    }
    
    client.release();
  } catch (error) {
    console.error('❌ Erro ao verificar tabelas:', error);
    throw error;
  }
}

// Criar tabelas se não existirem
async function createTables(client) {
  try {
    // Tabela de usuários
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        bot_id VARCHAR(255),
        bot_token VARCHAR(500),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Tabela de links de rastreamento
    await client.query(`
      CREATE TABLE IF NOT EXISTS tracking_links (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        campaign_id VARCHAR(255) NOT NULL,
        campaign_name VARCHAR(255),
        tracking_url TEXT NOT NULL,
        bot_id VARCHAR(255) NOT NULL,
        token VARCHAR(500) NOT NULL,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Tabela de eventos de rastreamento
    await client.query(`
      CREATE TABLE IF NOT EXISTS tracking_events (
        id SERIAL PRIMARY KEY,
        tracking_link_id INTEGER REFERENCES tracking_links(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        event_type VARCHAR(50) NOT NULL,
        campaign_id VARCHAR(255),
        sale_value DECIMAL(10,2),
        utmify_status VARCHAR(50) DEFAULT 'pending',
        utmify_response TEXT,
        ip_address INET,
        user_agent TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Tabela de relatórios
    await client.query(`
      CREATE TABLE IF NOT EXISTS reports (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        campaign_id VARCHAR(255),
        total_sales INTEGER DEFAULT 0,
        total_value DECIMAL(10,2) DEFAULT 0,
        conversion_rate DECIMAL(5,2) DEFAULT 0,
        period_start DATE,
        period_end DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Índices para melhor performance
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_tracking_events_user_id ON tracking_events(user_id);
      CREATE INDEX IF NOT EXISTS idx_tracking_events_campaign_id ON tracking_events(campaign_id);
      CREATE INDEX IF NOT EXISTS idx_tracking_links_user_id ON tracking_links(user_id);
      CREATE INDEX IF NOT EXISTS idx_reports_user_id ON reports(user_id);
    `);

    console.log('✅ Tabelas criadas com sucesso');
  } catch (error) {
    console.error('❌ Erro ao criar tabelas:', error);
    throw error;
  }
}

// Função para executar queries
async function query(text, params) {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('📊 Query executada:', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('❌ Erro na query:', error);
    throw error;
  }
}

// Função para obter cliente do pool
async function getClient() {
  return await pool.connect();
}

module.exports = {
  connectDatabase,
  query,
  getClient,
  pool
}; 