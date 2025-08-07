const axios = require('axios');

// Enviar dados para UTMify
async function sendToUtmify(data) {
  try {
    const utmifyUrl = process.env.UTMIFY_API_URL;
    const utmifyApiKey = process.env.UTMIFY_API_KEY;

    if (!utmifyUrl || !utmifyApiKey) {
      throw new Error('Configurações do UTMify não encontradas');
    }

    const payload = {
      bot_id: data.bot_id,
      sale_value: data.sale_value,
      campaign_id: data.campaign_id,
      status: data.status,
      timestamp: data.timestamp,
      user_token: data.user_token
    };

    const response = await axios.post(`${utmifyUrl}/api/sales`, payload, {
      headers: {
        'Authorization': `Bearer ${utmifyApiKey}`,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });

    console.log('✅ Dados enviados para UTMify:', response.status);
    return { success: true, data: response.data };

  } catch (error) {
    console.error('❌ Erro ao enviar para UTMify:', error.message);
    return { success: false, error: error.message };
  }
}

// Testar conexão com UTMify
async function testUtmifyConnection() {
  try {
    const utmifyUrl = process.env.UTMIFY_API_URL;
    const utmifyApiKey = process.env.UTMIFY_API_KEY;

    if (!utmifyUrl || !utmifyApiKey) {
      return { success: false, error: 'Configurações não encontradas' };
    }

    const response = await axios.get(`${utmifyUrl}/health`, {
      headers: { 'Authorization': `Bearer ${utmifyApiKey}` },
      timeout: 5000
    });

    return { success: true, status: response.status };

  } catch (error) {
    return { success: false, error: error.message };
  }
}

module.exports = {
  sendToUtmify,
  testUtmifyConnection
}; 