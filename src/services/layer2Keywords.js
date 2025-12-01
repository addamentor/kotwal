// Layer 2: Keyword/Context Analysis
const sensitiveKeywords = [
  'confidential', 'ssn', 'salary', 'employee', 'client', 'address', 'phone', 'email', 'company', 'secret', 'private',
  'passport', 'pan', 'aadhaar', 'bank', 'account', 'ifsc', 'routing', 'license', 'plate', 'ip', 'url', 'credit', 'card'
];

function layer2_keywords(text) {
  if (typeof text !== 'string') {
    text = String(text || '');
  }
  let findings = [];
  sensitiveKeywords.forEach(keyword => {
    const idx = text.toLowerCase().indexOf(keyword);
    if (idx !== -1) {
      findings.push({ type: 'keyword', value: keyword, position: [idx, idx + keyword.length] });
    }
  });
  const score = findings.length ? 0.6 + 0.1 * Math.min(findings.length, 4) : 0;
  return { score, findings };
}

module.exports = { layer2_keywords };
