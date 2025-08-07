const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { query } = require('../config/database');
const { generateSecureToken } = require('../utils/encryption');

const router = express.Router();

// Criar novo link de rastreamento
router.post('/links', authenticateToken, async (req, res) => {
  try {
    const { campaign_id, campaign_name } = req.body;
    const userId = req.user.id;

    if (!campaign_id) {
      return res.status(400).json({ success: false, message: 'ID da campanha é obrigatório' });
    }

    // Gerar token único para o link
    const token = generateSecureToken();
    
    // Criar URL de rastreamento
    const trackingUrl = `${process.env.BASE_URL || 'https://skpttrack.com'}/track?bot_id=${req.user.bot_id}&token=${token}&campaign=${campaign_id}`;

    // Salvar link no banco de dados
    const result = await query(
      `INSERT INTO tracking_links (user_id, campaign_id, campaign_name, tracking_url, bot_id, token) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING id, campaign_id, campaign_name, tracking_url, created_at`,
      [userId, campaign_id, campaign_name, trackingUrl, req.user.bot_id, token]
    );

    res.status(201).json({
      success: true,
      message: 'Link de rastreamento criado com sucesso',
      data: result.rows[0]
    });

  } catch (error) {
    console.error('❌ Erro ao criar link:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

// Listar links do usuário
router.get('/links', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    // Buscar links com paginação
    const result = await query(
      `SELECT id, campaign_id, campaign_name, tracking_url, is_active, created_at 
       FROM tracking_links 
       WHERE user_id = $1 
       ORDER BY created_at DESC 
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );

    // Contar total de links
    const countResult = await query(
      'SELECT COUNT(*) as total FROM tracking_links WHERE user_id = $1',
      [userId]
    );

    const total = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: {
        links: result.rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages
        }
      }
    });

  } catch (error) {
    console.error('❌ Erro ao listar links:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

// Deletar link de rastreamento
router.delete('/links/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Verificar se o link pertence ao usuário
    const checkResult = await query(
      'SELECT id FROM tracking_links WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Link não encontrado' });
    }

    // Deletar link
    await query('DELETE FROM tracking_links WHERE id = $1 AND user_id = $2', [id, userId]);

    res.json({
      success: true,
      message: 'Link deletado com sucesso'
    });

  } catch (error) {
    console.error('❌ Erro ao deletar link:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

// Ativar/desativar link
router.patch('/links/:id/toggle', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Verificar se o link pertence ao usuário
    const checkResult = await query(
      'SELECT id, is_active FROM tracking_links WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Link não encontrado' });
    }

    const currentStatus = checkResult.rows[0].is_active;
    const newStatus = !currentStatus;

    // Atualizar status
    await query(
      'UPDATE tracking_links SET is_active = $1 WHERE id = $2 AND user_id = $3',
      [newStatus, id, userId]
    );

    res.json({
      success: true,
      message: `Link ${newStatus ? 'ativado' : 'desativado'} com sucesso`,
      data: { is_active: newStatus }
    });

  } catch (error) {
    console.error('❌ Erro ao alterar status do link:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

// Obter estatísticas de um link
router.get('/links/:id/stats', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Verificar se o link pertence ao usuário
    const linkResult = await query(
      'SELECT id, campaign_id, campaign_name FROM tracking_links WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (linkResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Link não encontrado' });
    }

    // Buscar estatísticas
    const statsResult = await query(
      `SELECT 
         COUNT(*) as total_events,
         COUNT(CASE WHEN event_type = 'sale' THEN 1 END) as total_sales,
         SUM(CASE WHEN event_type = 'sale' THEN sale_value ELSE 0 END) as total_value
       FROM tracking_events 
       WHERE tracking_link_id = $1`,
      [id]
    );

    const stats = statsResult.rows[0];
    const conversionRate = stats.total_events > 0 ? (stats.total_sales / stats.total_events * 100).toFixed(2) : 0;

    res.json({
      success: true,
      data: {
        link: linkResult.rows[0],
        stats: {
          total_events: parseInt(stats.total_events),
          total_sales: parseInt(stats.total_sales),
          total_value: parseFloat(stats.total_value || 0),
          conversion_rate: parseFloat(conversionRate)
        }
      }
    });

  } catch (error) {
    console.error('❌ Erro ao obter estatísticas:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

module.exports = router; 