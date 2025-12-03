// Layer 2: Keyword/Context Analysis
const keywordRiskMap = {
  'confidential': 'high',
  'ssn': 'high',
  'salary': 'high',
  'employee': 'medium',
  'client': 'medium',
  'address': 'medium',
  'phone': 'medium',
  'email': 'medium',
  'company': 'low',
  'secret': 'high',
  'private': 'medium',
  'passport': 'high',
  'pan': 'high',
  'aadhaar': 'high',
  'bank': 'high',
  'account': 'medium',
  'ifsc': 'medium',
  'routing': 'medium',
  'license': 'low',
  'plate': 'low',
  'ip': 'low',
  'url': 'low',
  'credit': 'high',
  'card': 'high',
  'dob': 'high',
  'date of birth': 'high',
  'location': 'medium',
  'ssn': 'high',
  'passport': 'high',
  'pin': 'high',
  'token': 'high',
  'key': 'high',
  'password': 'high',
  'api': 'high',
  'access': 'high',
  'secret': 'high',
  'auth': 'high',
  'login': 'medium',
  'username': 'medium',
  'user': 'low',
  'admin': 'medium',
  'root': 'high',
  'master': 'high',
  'token': 'high',
  'session': 'medium',
  'cookie': 'medium',
  'csrf': 'high',
  'ssn': 'high',
  'credit card': 'high',
  'card number': 'high',
  'iban': 'high',
  'bic': 'high',
  'swift': 'high',
  'upi': 'high',
  'transaction': 'medium',
  'payment': 'medium',
  'amount': 'medium',
  'balance': 'medium',
  'statement': 'medium',
  'invoice': 'medium',
  'bill': 'medium',
  'tax': 'medium',
  'gst': 'medium',
  'pan': 'high',
  'aadhaar': 'high',
  'passport': 'high',
  'ssn': 'high',
  'dl': 'high',
  'driving license': 'high',
  'voter': 'high',
  'voter id': 'high',
  'insurance': 'medium',
  'policy': 'medium',
  'claim': 'medium',
  'premium': 'medium',
  'coverage': 'medium',
  'beneficiary': 'medium',
  'nominee': 'medium',
  'dependant': 'medium',
  'dependent': 'medium',
  'emergency': 'medium',
  'contact': 'medium',
  'phone number': 'medium',
  'mobile': 'medium',
  'cell': 'medium',
  'fax': 'low',
  'address': 'medium',
  'street': 'low',
  'city': 'low',
  'state': 'low',
  'country': 'low',
  'zip': 'low',
  'postal': 'low',
  'code': 'low',
  'pin': 'high',
  'location': 'medium',
  'geo': 'low',
  'lat': 'low',
  'lng': 'low',
  'long': 'low',
  'latitude': 'low',
  'longitude': 'low',
  'ssn': 'high',
  'passport': 'high',
  'pan': 'high',
  'aadhaar': 'high',
  'dl': 'high',
  'driving license': 'high',
  'voter': 'high',
  'voter id': 'high'
};

function layer2_keywords(text) {
  if (typeof text !== 'string') {
    text = String(text || '');
  }
  let findings = [];
  let score = 0;
  Object.keys(keywordRiskMap).forEach(keyword => {
    const idx = text.toLowerCase().indexOf(keyword);
    if (idx !== -1) {
      let risk = keywordRiskMap[keyword];
      let riskScore = risk === 'high' ? 80 : risk === 'medium' ? 50 : 20;
      findings.push({
        type: 'keyword',
        value: keyword,
        position: [idx, idx + keyword.length],
        risk,
        riskScore
      });
      score += riskScore;
    }
  });
  // Normalize score (max 1)
  score = findings.length ? Math.min(1, score / (findings.length * 100)) : 0;
  return { score, findings };
}

module.exports = { layer2_keywords };
