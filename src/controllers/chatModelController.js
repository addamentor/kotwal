const ChatModel = require('../models/chatModel');
const { Op } = require('sequelize');

// List available chat models for a company
async function listChatModels(req, res) {
  try {
    const tenantId = req.user.companyId;
    // Get global models and company-specific models
    const models = await ChatModel.findAll({
      where: {
        status: 'active',
        [Op.or]: [
          { tenantId: null },
          { tenantId }
        ]
      }
    });
    // Only return model name, provider, and id
    const filteredModels = models.map(m => ({
      id: m.id,
      name: m.name,
      provider: m.provider
    }));
    return res.json({ models: filteredModels });
  } catch (err) {
    console.error(err);
    let errorText = 'Failed to list chat models.';
    let description = err && err.message ? err.message : 'Unknown error';
    return res.status(500).json({ error: errorText, description });
  }
}

module.exports = { listChatModels };
