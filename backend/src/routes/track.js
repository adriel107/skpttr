const { query } = require('../config/database');
const { sendToUtmify } = require('../services/utmify');

// Endpoint público de rastreamento
module.exports = async (req, res) => {
  try {
    const { bot_id, token, campaign } = req.query;
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');

    // Validar parâmetros obrigatórios
    if (!bot_id || !token || !campaign) {
      return res.status(400).json({
        success: false,
        message: 'Parâmetros obrigatórios: bot_id, token, campaign'
      });
    }

    // Buscar link de rastreamento válido
    const linkResult = await query(
      `SELECT tl.id, tl.user_id, tl.campaign_id, tl.campaign_name, u.bot_token 
       FROM tracking_links tl 
       JOIN users u ON tl.user_id = u.id 
       WHERE tl.bot_id = $1 AND tl.token = $2 AND tl.campaign_id = $3 AND tl.is_active = true`,
      [bot_id, token, campaign]
    );

    if (linkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Link de rastreamento não encontrado ou inativo'
      });
    }

    const trackingLink = linkResult.rows[0];

    // Registrar evento de clique
    await query(
      `INSERT INTO tracking_events (tracking_link_id, user_id, event_type, campaign_id, ip_address, user_agent) 
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [trackingLink.id, trackingLink.user_id, 'click', campaign, ipAddress, userAgent]
    );

    // Verificar se é uma venda (parâmetro sale_value presente)
    const saleValue = req.query.sale_value;
    if (saleValue) {
      const saleAmount = parseFloat(saleValue);
      
      if (isNaN(saleAmount) || saleAmount <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Valor da venda deve ser um número positivo'
        });
      }

      // Registrar evento de venda
      await query(
        `INSERT INTO tracking_events (tracking_link_id, user_id, event_type, campaign_id, sale_value, ip_address, user_agent) 
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [trackingLink.id, trackingLink.user_id, 'sale', campaign, saleAmount, ipAddress, userAgent]
      );

      // Enviar dados para UTMify
      try {
        const utmifyData = {
          bot_id: bot_id,
          sale_value: saleAmount,
          campaign_id: campaign,
          status: '100%',
          timestamp: new Date().toISOString(),
          user_token: trackingLink.bot_token
        };

        const utmifyResponse = await sendToUtmify(utmifyData);
        
        // Atualizar status do evento
        await query(
          `UPDATE tracking_events 
           SET utmify_status = $1, utmify_response = $2 
           WHERE tracking_link_id = $3 AND event_type = 'sale' 
           ORDER BY created_at DESC LIMIT 1`,
          [utmifyResponse.success ? 'completed' : 'failed', JSON.stringify(utmifyResponse), trackingLink.id]
        );

        console.log('✅ Venda registrada e enviada para UTMify:', {
          campaign,
          saleValue: saleAmount,
          utmifyStatus: utmifyResponse.success
        });

      } catch (utmifyError) {
        console.error('❌ Erro ao enviar para UTMify:', utmifyError);
        
        // Marcar como falha
        await query(
          `UPDATE tracking_events 
           SET utmify_status = 'failed', utmify_response = $1 
           WHERE tracking_link_id = $2 AND event_type = 'sale' 
           ORDER BY created_at DESC LIMIT 1`,
          [JSON.stringify({ error: utmifyError.message }), trackingLink.id]
        );
      }
    }

    // Retornar resposta de sucesso
    res.json({
      success: true,
      message: 'Evento registrado com sucesso',
      data: {
        campaign_id: campaign,
        event_type: saleValue ? 'sale' : 'click',
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Erro no endpoint de rastreamento:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
}; 