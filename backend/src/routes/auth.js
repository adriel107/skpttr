const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query } = require('../config/database');
const { encrypt } = require('../utils/encryption');

const router = express.Router();

// Registro de usuário
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, bot_id, bot_token } = req.body;

    // Verificar se email já existe
    const existingUser = await query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(409).json({ success: false, message: 'Email já cadastrado' });
    }

    // Criptografar senha e token
    const passwordHash = await bcrypt.hash(password, 12);
    const encryptedBotToken = bot_token ? encrypt(bot_token) : null;

    // Inserir usuário
    const result = await query(
      `INSERT INTO users (name, email, password_hash, bot_id, bot_token) 
       VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, bot_id`,
      [name, email, passwordHash, bot_id, encryptedBotToken]
    );

    const user = result.rows[0];
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      success: true,
      message: 'Usuário registrado com sucesso',
      data: { user, token }
    });

  } catch (error) {
    console.error('❌ Erro no registro:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Buscar usuário
    const result = await query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Credenciais inválidas' });
    }

    const user = result.rows[0];

    // Verificar senha
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: 'Credenciais inválidas' });
    }

    // Gerar token
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({
      success: true,
      message: 'Login realizado com sucesso',
      data: { 
        user: { id: user.id, name: user.name, email: user.email, bot_id: user.bot_id },
        token 
      }
    });

  } catch (error) {
    console.error('❌ Erro no login:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

// Obter dados do usuário
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ success: false, message: 'Token necessário' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const result = await query('SELECT id, name, email, bot_id FROM users WHERE id = $1', [decoded.userId]);

    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Usuário não encontrado' });
    }

    res.json({ success: true, data: { user: result.rows[0] } });

  } catch (error) {
    console.error('❌ Erro ao obter usuário:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

module.exports = router; 