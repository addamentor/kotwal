const ChatModel = require('../models/chatModel');

// Create a new chat model (global or company-specific)
async function createChatModel(req, res) {
  try {
    const { name, provider, config, status } = req.body;
    // Only admin can create company-specific models
    let tenantId = null;
    if (req.user.role === 'admin') {
      tenantId = req.user.companyId;
    }
    const model = await ChatModel.create({
      name,
      provider,
      config,
      tenantId,
      status: status || 'active',
    });
    return res.status(201).json({ model });
  } catch (err) {
    console.error(err);
    let errorText = 'Failed to create chat model.';
    let description = err && err.message ? err.message : 'Unknown error';
    return res.status(500).json({ error: errorText, description });
  }
}

// Update an existing chat model (admin only)
async function updateChatModel(req, res) {
  try {
    const { id } = req.params;
    const { name, provider, config, status } = req.body;
    // Only admin can update company-specific models
    const model = await ChatModel.findOne({ where: { id, tenantId: req.user.companyId } });
    if (!model) {
      return res.status(404).json({ error: 'Chat model not found for your company.' });
    }
    if (name) model.name = name;
    if (provider) model.provider = provider;
    if (config) model.config = config;
    if (status) model.status = status;
    await model.save();
    return res.json({ model });
  } catch (err) {
    console.error(err);
    let errorText = 'Failed to update chat model.';
    let description = err && err.message ? err.message : 'Unknown error';
    return res.status(500).json({ error: errorText, description });
  }
}

module.exports = { createChatModel, updateChatModel };
