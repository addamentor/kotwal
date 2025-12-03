// PII Detection Controller
const { layer1_regex } = require('../services/layer1Regex');
const { layer2_keywords } = require('../services/layer2Keywords');
const { layer3_ner } = require('../services/layer3NER');
const { riskScoring } = require('../services/riskScoring');

async function detectPII(text, mode = 'high') {
  console.log("PII Detection input:", text);
  const start = Date.now();
  let matrix = [];
  let findings = [];
  let riskScore = 0;
  let action = 'ALLOW';
  let safe = true;

  // Helper to map finding types to labels and risk
  const typeLabels = {
    email: { label: 'Email Address', risk: 80 },
    phone: { label: 'Phone Number', risk: 85 },
    address: { label: 'Address', risk: 70 },
    name: { label: 'Name', risk: 60 },
    company: { label: 'Company Name', risk: 60 },
    credit_card: { label: 'Credit Card', risk: 100 },
    ssn: { label: 'Social Security Number', risk: 95 },
    passport: { label: 'Passport Number', risk: 90 },
    pan: { label: 'PAN Number', risk: 90 },
    aadhaar: { label: 'Aadhaar Number', risk: 90 },
    ip: { label: 'IP Address', risk: 60 },
    url: { label: 'URL', risk: 50 },
    bank_account: { label: 'Bank Account', risk: 95 },
    ifsc: { label: 'IFSC Code', risk: 80 },
    routing: { label: 'Routing Number', risk: 80 },
    license_plate: { label: 'License Plate', risk: 60 },
    keyword: { label: 'Sensitive Keyword', risk: 60 },
    ner: { label: 'Named Entity', risk: 70 }
  };

  // Layer 1: select function based on mode
  let l1;
  if (mode === 'high') {
    l1 = require('../services/layer1Regex').layer1_regex_high(text);
  } else if (mode === 'medium') {
    l1 = require('../services/layer1Regex').layer1_regex_medium(text);
  } else {
    l1 = require('../services/layer1Regex').layer1_regex_low(text);
  }
  matrix.push({ layer: 'regex', ...l1 });
  if (l1.findings.length) {
    l1.findings.forEach(f => {
      findings.push({
        type: f.type.toUpperCase(),
        label: typeLabels[f.type]?.label || f.type,
        riskScore: f.riskScore || typeLabels[f.type]?.risk || 60,
        layer: f.risk === 'high' ? 'REGEX_HIGH_RISK' : 'REGEX'
      });
    });
    riskScore = Math.max(riskScore, ...findings.map(f => f.riskScore));
    if (l1.findings.some(f => f.risk === 'high')) {
      action = 'BLOCK';
      safe = false;
      return {
        success: true,
        safe,
        action,
        findings,
        riskScore,
        latencyMs: Date.now() - start
      };
    }
  }

  // Layer 2
  const l2 = layer2_keywords(text);
  matrix.push({ layer: 'keywords', ...l2 });
  if (l2.findings.length) {
    l2.findings.forEach(f => {
      findings.push({
        type: f.type.toUpperCase(),
        label: typeLabels[f.type]?.label || f.type,
        riskScore: f.riskScore || typeLabels[f.type]?.risk || 60,
        layer: f.risk === 'high' ? 'KEYWORD_HIGH_RISK' : f.risk === 'medium' ? 'KEYWORD_MEDIUM_RISK' : 'KEYWORD_LOW_RISK'
      });
    });
    riskScore = Math.max(riskScore, ...findings.map(f => f.riskScore));
    // Do not block on keyword matches, just score mapping
  }

  // Layer 3 (NER is async)
  let l3 = { score: 0, findings: [] };
  if (typeof layer3_ner === 'function' && layer3_ner.constructor.name === 'AsyncFunction') {
    l3 = await layer3_ner(text);
  } else {
    l3 = layer3_ner(text);
  }
  matrix.push({ layer: 'ner', ...l3 });
  if (Array.isArray(l3.findings) && l3.findings.length) {
    l3.findings.forEach(f => {
      findings.push({
        type: f.type ? f.type.toUpperCase() : 'NER',
        label: typeLabels[f.type]?.label || f.label || 'Named Entity',
        riskScore: f.riskScore || typeLabels[f.type]?.risk || 60,
        layer: l3.score >= 0.8 ? 'NER_HIGH_RISK' : 'NER'
      });
    });
    riskScore = Math.max(riskScore, ...findings.map(f => f.riskScore));
    if (l3.score >= 0.8) {
      action = 'BLOCK';
      safe = false;
      return {
        success: true,
        safe,
        action,
        findings,
        riskScore,
        latencyMs: Date.now() - start
      };
    }
  }

  // Final risk scoring (only block if regex or NER triggered it)
  // Keywords only contribute to risk score, never block
  return {
    success: true,
    safe,
    action,
    findings,
    riskScore,
    latencyMs: Date.now() - start
  };
}
module.exports = { detectPII };
