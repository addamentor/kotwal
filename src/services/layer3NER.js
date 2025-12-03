const axios = require('axios');

// Layer 3: Named Entity Recognition (NER) - stub
// In production, integrate with spaCy, HuggingFace, or similar
async function layer3_ner(text) {
  try {
    const response = await axios.post('http://localhost:5000/ner', { text });
    const entities = response.data.entities || [];
    // Map entities to findings format
    const findings = entities.map(ent => ({
      type: 'ner',
      value: ent.text,
      label: ent.label,
      risk: ['PERSON', 'ORG', 'GPE', 'LOC'].includes(ent.label) ? 'high' : 'low',
      riskScore: ['PERSON', 'ORG', 'GPE', 'LOC'].includes(ent.label) ? 70 : 30
    }));
    // Score: use max riskScore from findings, or 0 if none
    const score = findings.length ? Math.max(...findings.map(f => f.riskScore)) : 0;
    return { score, findings };
  } catch (err) {
    return { score: 0, findings: [] };
  }
}

module.exports = { layer3_ner };
