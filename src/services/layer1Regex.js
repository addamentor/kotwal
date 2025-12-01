// Layer 1: Fast Regex Scan for PII
const regexPatterns = {
  // Email
  email: /(?:\b(?:my|the)?\s*email\s*(?:is|:|=)?\s*)?([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/gi,
  // Phone
  phone: /(?:\b(?:my|the)?\s*phone\s*(?:is|:|=)?\s*)?(\+?\d{1,3}[-.\s]?)?(\(?\d{3}\)?[-.\s]?){2}\d{4}/gi,
  // Address
  address: /(?:\b(?:my|the)?\s*address\s*(?:is|:|=)?\s*)?(\d{1,5}\s(?:[A-Za-z0-9#.,\-]+\s){1,5}(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Lane|Ln|Drive|Dr|Court|Ct|Square|Sq|Loop|Trail|Trl|Parkway|Pkwy|Circle|Cir)\b)/gi,
  // Name
  name: /(?:\b(?:my|the)?\s*name\s*(?:is|:|=)?\s*)?([A-Z][a-z]+\s[A-Z][a-z]+)/g,
  // Company (match suffix, but treat 'Pvt Ltd' and similar as low risk unless context is strong)
  company: /([A-Z][a-zA-Z0-9& ]+\s)?(Inc|LLC|Ltd|Corporation|Corp|PLC|Group|Associates|Partners|Pvt\sLtd)\b/gi,
  // Credit card
  credit_card: /(?:\b(?:my|the)?\s*credit\s*card\s*(?:is|:|=)?\s*)?(\d{13,16})/g,
  // SSN
  ssn: /(?:\b(?:my|the)?\s*ssn\s*(?:is|:|=)?\s*)?(\d{3}[- ]?\d{2}[- ]?\d{4})/g,
  // Passport
  passport: /(?:\b(?:my|the)?\s*passport\s*(?:is|:|=)?\s*)?([A-PR-WYa-pr-wy][1-9]\d\s?\d{4}[1-9])/g,
  // PAN (India)
  pan: /(?:\b(?:my|the)?\s*pan\s*(?:is|:|=)?\s*)?([A-Z]{5}[0-9]{4}[A-Z]{1})/g,
  // Aadhaar (India)
  aadhaar: /(?:\b(?:my|the)?\s*aadhaar\s*(?:is|:|=)?\s*)?(\d{4}\s\d{4}\s\d{4})/g,
  // IP
  ip: /(?:\b(?:my|the)?\s*ip\s*(?:is|:|=)?\s*)?((?:\d{1,3}\.){3}\d{1,3})/g,
  // URL
  url: /(?:\b(?:my|the)?\s*url\s*(?:is|:|=)?\s*)?(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,})/gi,
  // Bank account
  bank_account: /(?:\b(?:my|the)?\s*account\s*(?:is|:|=)?\s*)?(\d{8,18})/g,
  // IFSC (India)
  ifsc: /(?:\b(?:my|the)?\s*ifsc\s*(?:is|:|=)?\s*)?([A-Z]{4}0[A-Z0-9]{6})/g,
  // Routing (US)
  routing: /(?:\b(?:my|the)?\s*routing\s*(?:is|:|=)?\s*)?(\d{9})/g,
  // License plate
  license_plate: /(?:\b(?:my|the)?\s*license\s*plate\s*(?:is|:|=)?\s*)?([A-Z]{2,3}-?\d{1,4}-?[A-Z]{1,2})/g,
  // Private key
  private_key: /-----BEGIN (RSA|DSA|EC|PRIVATE|ENCRYPTED|PGP|OPENSSH) PRIVATE KEY-----[\s\S]+?-----END (RSA|DSA|EC|PRIVATE|ENCRYPTED|PGP|OPENSSH) PRIVATE KEY-----/g,
  // Password
  password: /(?:\b(?:my|the)?\s*(password|pwd|passcode|secret|key)\s*(?:is|:|=)?\s*)([^\s]+)/gi,
  // Secret key (AWS, generic)
  secret_key: /("|')?(AKIA|ASIA|AGPA|AIDA|AROA|AIPA|ANPA|ACCA|AMKA|APKA)[A-Z0-9]{16}("|')?/g
};

function layer1_regex(text) {
    console.log("Layer 1 input:", text);
  if (typeof text !== 'string') {
    text = String(text || '');
  }
  let findings = [];
  // Per-type risk scores
  const typeRiskScores = {
    email: 80, 
    phone: 85,
    address: 70,
    name: 60,
    company: 60,
    credit_card: 100,
    ssn: 95,
    passport: 90,
    pan: 90,
    aadhaar: 90,
    ip: 60,
    url: 50,
    bank_account: 95,
    ifsc: 80,
    routing: 80,
    license_plate: 60,
    private_key: 100,
    password: 100,
    secret_key: 100
  };
  Object.entries(regexPatterns).forEach(([type, pattern]) => {
    const matches = [...text.matchAll(pattern)];
    matches.forEach(match => {
      // For all patterns, the last capturing group is the sensitive value
      let actualValue = null;
      for (let i = match.length - 1; i > 0; i--) {
        if (match[i] && match[i].length > 3) {
          actualValue = match[i].trim();
          break;
        }
      }
      if (actualValue) {
        const riskScore = typeRiskScores[type] || 60;
        let risk = 'low';
        // For company, only mark as high risk if context is strong (not just suffix)
        if (type === 'company') {
          // If value is just 'Pvt Ltd' or similar, keep low risk
          if (/^(Pvt\sLtd|Ltd|LLC|Inc|Corp|PLC|Group|Associates|Partners|Corporation)$/i.test(actualValue.trim())) {
            risk = 'low';
          } else if (/([A-Z][a-zA-Z0-9& ]+\s)(Inc|LLC|Ltd|Corporation|Corp|PLC|Group|Associates|Partners|Pvt\sLtd)\b/i.test(actualValue)) {
            risk = 'high';
          }
        } else if (riskScore >= 80) {
          // For other types, only mark as high risk if value is not generic
          if (actualValue.length > 5 && !/^test|sample|demo|none|unknown$/i.test(actualValue.trim())) {
            risk = 'high';
          }
        }
        findings.push({
          type,
          value: actualValue,
          position: [match.index, match.index + actualValue.length],
          risk,
          riskScore
        });
      }
    });
  });
  // Set overall score as the highest riskScore found, normalized to 0-1
  let score = 0;
  if (findings.length > 0) {
    const maxRisk = Math.max(...findings.map(f => f.riskScore));
    score = maxRisk / 100;
    if (maxRisk >= 80) score = Math.max(score, 0.8);
  }
  return { score, findings };
}

module.exports = { layer1_regex };
