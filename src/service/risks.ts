export function calculateRiskScore(probability: number, impact: number) {
  return probability * impact
}

export function calculateRiskLevel(probability: number, impact: number) {
  const score = calculateRiskScore(probability, impact)

  if (score >= 17) return 'CRITICAL'
  if (score >= 10) return 'HIGH'
  if (score >= 5) return 'MEDIUM'
  return 'LOW'
}
