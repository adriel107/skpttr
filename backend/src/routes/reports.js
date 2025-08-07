const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { query } = require('../config/database');

const router = express.Router();

// Dashboard geral
router.get('/dashboard', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Estatísticas gerais
    const statsResult = await query(
      `SELECT 
         COUNT(DISTINCT tl.id) as total_campaigns,
         COUNT(te.id) as total_events,
         COUNT(CASE WHEN te.event_type = 'sale' THEN 1 END) as total_sales,
         SUM(CASE WHEN te.event_type = 'sale' THEN te.sale_value ELSE 0 END) as total_value
       FROM tracking_links tl
       LEFT JOIN tracking_events te ON tl.id = te.tracking_link_id
       WHERE tl.user_id = $1`,
      [userId]
    );

    const stats = statsResult.rows[0];
    const conversionRate = stats.total_events > 0 ? (stats.total_sales / stats.total_events * 100).toFixed(2) : 0;

    // Vendas recentes
    const recentSalesResult = await query(
      `SELECT te.campaign_id, te.sale_value, te.created_at, te.utmify_status
       FROM tracking_events te
       JOIN tracking_links tl ON te.tracking_link_id = tl.id
       WHERE tl.user_id = $1 AND te.event_type = 'sale'
       ORDER BY te.created_at DESC LIMIT 10`,
      [userId]
    );

    res.json({
      success: true,
      data: {
        stats: {
          total_campaigns: parseInt(stats.total_campaigns),
          total_events: parseInt(stats.total_events),
          total_sales: parseInt(stats.total_sales),
          total_value: parseFloat(stats.total_value || 0),
          conversion_rate: parseFloat(conversionRate)
        },
        recent_sales: recentSalesResult.rows
      }
    });

  } catch (error) {
    console.error('❌ Erro ao obter dashboard:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

// Relatório de campanhas
router.get('/campaigns', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await query(
      `SELECT 
         tl.campaign_id,
         tl.campaign_name,
         COUNT(te.id) as total_events,
         COUNT(CASE WHEN te.event_type = 'sale' THEN 1 END) as total_sales,
         SUM(CASE WHEN te.event_type = 'sale' THEN te.sale_value ELSE 0 END) as total_value
       FROM tracking_links tl
       LEFT JOIN tracking_events te ON tl.id = te.tracking_link_id
       WHERE tl.user_id = $1
       GROUP BY tl.campaign_id, tl.campaign_name
       ORDER BY total_events DESC`,
      [userId]
    );

    const campaigns = result.rows.map(campaign => ({
      ...campaign,
      conversion_rate: campaign.total_events > 0 ? 
        ((campaign.total_sales / campaign.total_events) * 100).toFixed(2) : '0.00'
    }));

    res.json({ success: true, data: campaigns });

  } catch (error) {
    console.error('❌ Erro ao obter relatório de campanhas:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

// Relatório de vendas
router.get('/sales', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const result = await query(
      `SELECT 
         te.campaign_id,
         te.sale_value,
         te.created_at,
         te.utmify_status,
         tl.campaign_name
       FROM tracking_events te
       JOIN tracking_links tl ON te.tracking_link_id = tl.id
       WHERE tl.user_id = $1 AND te.event_type = 'sale'
       ORDER BY te.created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );

    res.json({ success: true, data: result.rows });

  } catch (error) {
    console.error('❌ Erro ao obter relatório de vendas:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

module.exports = router; 