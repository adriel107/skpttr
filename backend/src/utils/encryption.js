const crypto = require('crypto');

// Chave de criptografia (deve ter 32 caracteres)
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'your_32_character_encryption_key_here';
const ALGORITHM = 'aes-256-cbc';

// Função para criptografar dados
function encrypt(text) {
  try {
    if (!text) return null;
    
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher(ALGORITHM, ENCRYPTION_KEY);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    return iv.toString('hex') + ':' + encrypted;
  } catch (error) {
    console.error('❌ Erro ao criptografar:', error);
    throw new Error('Erro ao criptografar dados');
  }
}

// Função para descriptografar dados
function decrypt(encryptedText) {
  try {
    if (!encryptedText) return null;
    
    const textParts = encryptedText.split(':');
    const iv = Buffer.from(textParts.shift(), 'hex');
    const encrypted = textParts.join(':');
    
    const decipher = crypto.createDecipher(ALGORITHM, ENCRYPTION_KEY);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('❌ Erro ao descriptografar:', error);
    throw new Error('Erro ao descriptografar dados');
  }
}

// Função para gerar hash seguro
function generateHash(text) {
  return crypto.createHash('sha256').update(text).digest('hex');
}

// Função para gerar token seguro
function generateSecureToken() {
  return crypto.randomBytes(32).toString('hex');
}

// Função para validar se a chave de criptografia está configurada
function validateEncryptionKey() {
  if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length !== 32) {
    throw new Error('ENCRYPTION_KEY deve ter exatamente 32 caracteres');
  }
}

module.exports = {
  encrypt,
  decrypt,
  generateHash,
  generateSecureToken,
  validateEncryptionKey
}; 