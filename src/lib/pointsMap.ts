/**
 * Points map for scoring each horse in a race.
 * Derived from analysis of 614 completed V85 races (6 791 starts).
 * Total max score: 100 pts + 1 bonus pt.
 *
 * All rank-based tables use 1-based indexing (index 0 is unused/fallback).
 * All win-percentage thresholds use actual % values — divide raw
 * `winPercentage` fields (stored as integer × 100) by 100 before comparing.
 *
 * Form score formula (Groups B):
 *   score = Σ placeScore(records[i].place) × recencyWeight[i]   for i in 0..4
 *   where placeScore: 1st=5, 2nd=3, 3rd=2, 4th=1, 5th+=0, galloped=0
 *   and   recencyWeight = [1.0, 0.85, 0.70, 0.55, 0.40]
 */

// ─── Group A · Market Intelligence · 22 pts max ──────────────────────────────

/**
 * Win-pool odds rank within the race field (rank 1 = lowest odds / favourite).
 * Rank 1 wins 35.8 % of races; rank 2 wins 22.5 %; rank 3 wins 13.0 %.
 * Index 0 is unused; index 8+ all receive 2 pts.
 */
export const ODDS_RANK_POINTS = [0, 22, 17, 12, 8, 6, 4, 2] as const;

// ─── Group B · Recent Form · 20 pts max ──────────────────────────────────────

/**
 * Form score thresholds (descending). Compare computed form score against
 * `threshold`; use the `pts` of the first entry the score meets.
 * Score 12+ wins 30.3 % of races; score 0–3 wins only 2.9 %.
 */
export const FORM_SCORE_POINTS: { threshold: number; pts: number }[] = [
  { threshold: 12, pts: 15 },
  { threshold: 9, pts: 12 },
  { threshold: 6, pts: 8 },
  { threshold: 3, pts: 5 },
  { threshold: 0, pts: 1 },
];

/**
 * Whether the horse galloped (broke gait) in any of the last 5 starts.
 * Galloped horses win 6.0 % vs 10.1 % for clean horses.
 */
export const GALLOP_POINTS = {
  clean: 5,
  hasGallop: 0,
} as const;

// ─── Group C · Class & Ability Rating · 18 pts max ───────────────────────────

/**
 * `horse.statistics.life.startPoints` rank within the race field
 * (rank 1 = highest rating). Rank 1 wins 24.4 % of races.
 * Index 0 is unused; index 6+ receive 2 pts.
 */
export const START_POINTS_RANK_POINTS = [0, 12, 9, 6, 4, 2] as const;

/**
 * `horse.statistics.life.earningsPerStart` rank within the race field
 * (rank 1 = highest earnings per start). Captures career class level.
 * Index 0 is unused; index 7+ receive 1 pt.
 */
export const EARNINGS_PER_START_RANK_POINTS = [0, 6, 4, 4, 2, 2, 1] as const;

// ─── Group D · Personnel Quality · 14 pts max ────────────────────────────────

/**
 * Driver current-season win% thresholds (descending).
 * Use raw `winPercentage` ÷ 100 before comparing.
 * Drivers with 20–25 % win rate drive winners 15.3 % of the time.
 */
export const DRIVER_WIN_PCT_POINTS: { threshold: number; pts: number }[] = [
  { threshold: 20, pts: 8 },
  { threshold: 15, pts: 6 },
  { threshold: 10, pts: 4 },
  { threshold: 0, pts: 2 },
];

/**
 * Penalty applied when the original driver was replaced (originalDriver field
 * present). Last-minute driver changes correlate with a win rate of only 5.9 %
 * vs 9.1 % when the driver is unchanged.
 */
export const DRIVER_CHANGED_PENALTY = -3;

/**
 * Trainer current-season win% thresholds (descending).
 * Use raw `winPercentage` ÷ 100 before comparing.
 * Trainers with 25 %+ win rate have horses win 15.1 % of races.
 */
export const TRAINER_WIN_PCT_POINTS: { threshold: number; pts: number }[] = [
  { threshold: 25, pts: 6 },
  { threshold: 20, pts: 5 },
  { threshold: 15, pts: 4 },
  { threshold: 10, pts: 2 },
  { threshold: 0, pts: 1 },
];

// ─── Group E · Career Win Rate · 5 pts max ───────────────────────────────────

/**
 * `horse.statistics.life.winPercentage` rank within the race field
 * (rank 1 = highest career win %).
 * Index 0 is unused; index 6+ receive 1 pt.
 */
export const HORSE_WIN_PCT_RANK_POINTS = [0, 5, 4, 3, 2, 1] as const;

// ─── Group F · Post Position · 5 pts max ─────────────────────────────────────

/**
 * Post position points by start method. Index = postPosition (1-based).
 *
 * Volte (mobile): PP 1 wins 12.5 %; PP 5–6 also strong (better horses
 * placed outside in handicap races). PP 8+ near 0 %.
 *
 * Auto (standing): PP 1–6 roughly equal at 10–13 %; PP 8–10 weakest at 4–6 %;
 * PP 11–12 partially recover to ~7–8 %.
 */
export const POST_POSITION_POINTS = {
  volte: [0, 5, 3, 3, 3, 4, 4, 2, 0, 0, 0, 0, 0, 0, 0, 0] as const,
  auto: [0, 5, 5, 5, 5, 5, 5, 3, 1, 1, 1, 3, 3, 1, 1, 1] as const,
} as const;

// ─── Bonus Signal ─────────────────────────────────────────────────────────────

/**
 * +1 bonus when either front or back shoe was changed before the race.
 * Indicates trainer intervention; marginal but real: +1.1 pp win rate lift.
 */
export const SHOE_CHANGED_BONUS = 1;

// ─── Convenience: flat map for iteration / display ───────────────────────────

export const POINTS_MAP = {
  oddsRank: ODDS_RANK_POINTS,

  formScore: FORM_SCORE_POINTS,
  gallop: GALLOP_POINTS,
  startPointsRank: START_POINTS_RANK_POINTS,
  earningsPerStartRank: EARNINGS_PER_START_RANK_POINTS,
  driverWinPct: DRIVER_WIN_PCT_POINTS,
  driverChangedPenalty: DRIVER_CHANGED_PENALTY,
  trainerWinPct: TRAINER_WIN_PCT_POINTS,
  horseWinPctRank: HORSE_WIN_PCT_RANK_POINTS,
  postPosition: POST_POSITION_POINTS,
  shoeChangedBonus: SHOE_CHANGED_BONUS,
} as const;
