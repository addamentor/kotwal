const ChatLog = require('../../models/chatLog');
const ChatModel = require('../../models/chatModel');
const { detectPII } = require('../../controllers/piiController');
const { Op } = require('sequelize');

// Chat API: send message
async function sendChat(req, res) {
  try {
    const { modelId, message, overridePII } = req.body;
    const userId = req.user.id;
    const tenantId = req.user.companyId;

    // Check model exists and is available for this tenant
    const model = await ChatModel.findOne({
      where: {
        id: modelId,
        status: 'active',
        [Op.or]: [
          { tenantId: null },
          { tenantId }
        ]
      }
    });
    if (!model) {
      return res.status(404).json({ error: 'Chat model not found or not available for your company.' });
    }

    // Run PII detection (all 3 layers)
    const piiResult = await detectPII(message, 'high');
    let piiFlag = piiResult && piiResult.riskScore > 0;
    let piiDetails = piiResult;

    // If PII found and not overridden, block and log
    if (piiFlag && !overridePII) {
      await ChatLog.create({
        userId,
        tenantId,
        modelId,
        message,
        piiFlag,
        piiDetails,
        override: false
      });
      return res.status(400).json({ error: 'Sensitive data found in message.', piiDetails });
    }

    // Get tenant billing info
    const Tenant = require('../../models/company');
    const tenant = await Tenant.findByPk(tenantId);
    if (!tenant) {
      return res.status(400).json({ error: 'Tenant not found.' });
    }

    // Proceed to AI model (mock response for now)
    // TODO: Integrate with actual AI model
    const aiResponse = `AI response for: ${message}`;

    // Track usage (mock tokens and cost for now)
    const tokensUsed = message.length + (aiResponse ? aiResponse.length : 0); // simplistic token count
    const costPerToken = model.config && model.config.pricePerToken ? parseFloat(model.config.pricePerToken) : 0.01;
    const cost = tokensUsed * costPerToken;

    // Prepaid logic
    if (tenant.billingType === 'prepaid') {
      if (parseFloat(tenant.prepaidTokens) < tokensUsed) {
        return res.status(402).json({ error: 'Insufficient prepaid tokens. Please top up to continue.' });
      }
      // Deduct tokens
      tenant.prepaidTokens = parseFloat(tenant.prepaidTokens) - tokensUsed;
      await tenant.save();
    }

    const chatLog = await ChatLog.create({
      userId,
      tenantId,
      modelId,
      message,
      response: aiResponse,
      piiFlag,
      piiDetails,
      override: !!overridePII
    });

    const UsageLog = require('../../models/usageLog');
    await UsageLog.create({
      userId,
      tenantId,
      modelId,
      tokensUsed,
      cost,
      chatLogId: chatLog.id
    });

    return res.json({ response: aiResponse, tokensUsed, cost, prepaidTokens: tenant.prepaidTokens });
  } catch (err) {
    console.error(err);
    let errorText = 'Chat failed.';
    let description = err && err.message ? err.message : 'Unknown error';
    return res.status(500).json({ error: errorText, description });
  }
}

module.exports = { sendChat };
