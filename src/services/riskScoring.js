// Layer 4: Risk Scoring
function riskScoring(matrix) {
  // Decision: If any layer score >= 0.8, flag as sensitive
  const maxScore = Math.max(...matrix.map(l => l.score));
  return maxScore >= 0.8 ? 'sensitive' : 'safe';
}

module.exports = { riskScoring };
