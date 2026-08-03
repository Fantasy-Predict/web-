// lib/scoring.ts

export type Prediction = {
  outcome: "home" | "draw" | "away";
  homeScore: number;
  awayScore: number;
};

export type ActualResult = {
  outcome: "home" | "draw" | "away";
  homeScore: number;
  awayScore: number;
};

export type ScoringResult = {
  points: number;
  label: "Exact" | "Close" | "Correct" | "Wrong";
  description: string;
};

/**
 * Calculate points based on prediction vs actual result
 * 
 * Points System:
 * - Exact score: 5 points
 * - Close (goal margin): 3 points
 * - Correct outcome: 2 points
 * - Wrong: 0 points
 */
export function calculatePoints(
  prediction: Prediction,
  actual: ActualResult
): ScoringResult {
  // 1. Check Exact Score
  if (
    prediction.homeScore === actual.homeScore &&
    prediction.awayScore === actual.awayScore
  ) {
    return {
      points: 5,
      label: "Exact",
      description: "Perfect prediction! Exact score matched.",
    };
  }

  // 2. Check Goal Margin (Close)
  const predictedMargin = Math.abs(prediction.homeScore - prediction.awayScore);
  const actualMargin = Math.abs(actual.homeScore - actual.awayScore);

  if (predictedMargin === actualMargin) {
    return {
      points: 3,
      label: "Close",
      description: `Correct goal margin (${actualMargin} goal difference).`,
    };
  }

  // 3. Check Outcome (Correct)
  if (prediction.outcome === actual.outcome) {
    return {
      points: 2,
      label: "Correct",
      description: "Correct outcome (win/draw/loss).",
    };
  }

  // 4. Wrong
  return {
    points: 0,
    label: "Wrong",
    description: "Incorrect prediction.",
  };
}

/**
 * Helper to get outcome from score
 */
export function getOutcomeFromScore(
  homeScore: number,
  awayScore: number
): "home" | "draw" | "away" {
  if (homeScore > awayScore) return "home";
  if (homeScore < awayScore) return "away";
  return "draw";
}