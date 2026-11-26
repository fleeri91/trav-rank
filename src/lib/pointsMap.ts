/**
 * Points map for scoring each horse in a race.
 * Derived from analysis of 652 completed V85 races (7 202 starts).
 * Total max score: 101 pts.
 *
 * All rank-based tables use 1-based indexing (index 0 is unused/fallback),
 * except RECORD_PLACE_POINTS where index 0 = DQ (place=0).
 * All win-percentage thresholds use actual % values — divide raw
 * `winPercentage` fields (stored as integer × 100) by 100 before comparing.
 *
 * Form score formula (Groups B & H):
 *   score = Σ placeScore(records[i].place) × recencyWeight[i]   for i in 0..4
 *   where placeScore: 1st=5, 2nd=3, 3rd=2, 4th=1, 5th+=0, galloped=0
 *   and   recencyWeight = [1.0, 0.85, 0.70, 0.55, 0.40]
 *
 * Group H adds a condition filter: only records matching the current race's
 * distance category (short ≤1800 m / medium ≤2400 m / long >2400 m) AND
 * startMethod are included.
 */

// ─── Group A · Market Intelligence · 14 pts max ──────────────────────────────

/**
 * Win-pool odds rank within the race field (rank 1 = lowest odds / favourite).
 * Rank 1 wins 36.0 % of races; rank 2 wins 23.2 %; rank 3 wins 12.6 %;
 * rank 4+ drop to near or below the 9.1 % baseline win rate.
 * Index 0 is unused; index 7+ all receive 2 pts.
 */
export const ODDS_RANK_POINTS = [0, 14, 10, 7, 5, 4, 3, 2] as const;

// ─── Group B · Recent Form · 14 pts max ──────────────────────────────────────

/**
 * Form score thresholds (descending). Compare computed form score against
 * `threshold`; use the `pts` of the first entry the score meets.
 *
 * Score 12+ wins 29.0 % of races (3.2× baseline).
 * Score 6–8.9 wins 9.3 % — at baseline, so earns 0 pts.
 * Score <3 wins 2.8–6.3 % — below baseline, so earns 0 pts.
 *
 * General form is given lower weight than condition-specific form (Group H)
 * because it includes races at different distances/start methods.
 */
export const FORM_SCORE_POINTS: { threshold: number; pts: number }[] = [
  { threshold: 12, pts: 14 },
  { threshold: 9,  pts: 9  },
  { threshold: 6,  pts: 5  },
  { threshold: 3,  pts: 2  },
];

/**
 * Whether the horse galloped (broke gait) in any of the last 5 starts under
 * the same startMethod AND was disqualified.
 */
export const GALLOP_POINTS = {
  clean: 5,
  hasGallop: 0,
} as const;

// ─── Group C · Class & Ability Rating · 18 pts max ───────────────────────────

/**
 * `horse.statistics.life.startPoints` rank within the race field
 * (rank 1 = highest rating). Rank 1 wins 24.2 % of races.
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
 * Drivers with 20%+ win rate drive winners 14.2 % of the time.
 */
export const DRIVER_WIN_PCT_POINTS: { threshold: number; pts: number }[] = [
  { threshold: 20, pts: 8 },
  { threshold: 15, pts: 6 },
  { threshold: 10, pts: 4 },
  { threshold: 0,  pts: 2 },
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
 * Trainers with 25 %+ win rate have horses win 15.0 % of races.
 */
export const TRAINER_WIN_PCT_POINTS: { threshold: number; pts: number }[] = [
  { threshold: 25, pts: 6 },
  { threshold: 20, pts: 5 },
  { threshold: 15, pts: 4 },
  { threshold: 10, pts: 2 },
  { threshold: 0,  pts: 1 },
];

// ─── Group E · Career Win Rate · 5 pts max ───────────────────────────────────

/**
 * `horse.statistics.life.winPercentage` rank within the race field
 * (rank 1 = highest career win %). Rank 1 wins 23.6 % of races.
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
  auto:  [0, 5, 5, 5, 5, 5, 5, 3, 1, 1, 1, 3, 3, 1, 1, 1] as const,
} as const;

// ─── Group G · Record Quality at Matching Conditions · 8 pts max ─────────────

/**
 * Km-time rank within the race field, using each horse's personal best
 * (horse.statistics.life.records) at the same distance category + startMethod.
 * Rank 1 = fastest recorded km-time. Horses with no matching record score 0.
 *
 * Rank 1 wins 14.9 % of races (1.6× baseline); rank 3 wins 10.2 % (1.1×);
 * rank 4+ are at or below baseline. Reduced cap vs prior version.
 * Index 0 is unused; index 6+ are clamped to 1 pt.
 */
export const KM_TIME_RANK_POINTS = [0, 5, 4, 3, 2, 1, 1] as const;

/**
 * Place achieved when the horse's personal best km-time was set at the current
 * distance category + startMethod.
 *
 * Index = finishing place (0 = DQ/galloped, 1 = won, 2–3 = placed, 4+ = field).
 * Index 4 is the last entry; values 4 and above are clamped to 1 pt.
 *
 * Place 1 wins 12.6 % of races; DQ wins only 5.6 %.
 */
export const RECORD_PLACE_POINTS = [0, 3, 2, 2, 1] as const;

// ─── Group H · Condition-Specific Form Score · 18 pts max ────────────────────

/**
 * Weighted form score using only starts from start.records[] that match the
 * current race's distance category AND startMethod — the same formula as the
 * general form score (Group B), but filtered to relevant conditions.
 *
 * This is the single most predictive signal in the model:
 *   score 12+ → 39.2 % win rate (4.3× baseline)
 *   score 9–11.9 → 20.7 % (2.3×)
 *   score 6–8.9  →  9.7 % (1.1×, just above baseline)
 *   score 3–5.9  →  7.5 % (0.8×, slightly below baseline)
 *   score 0      →  1.5 % (well below baseline)
 *
 * Capped at 18 pts (above the 14-pt general form cap) to reflect the stronger
 * predictive signal. Score 0 = 0 pts.
 */
export const CONDITION_FORM_SCORE_POINTS: { threshold: number; pts: number }[] = [
  { threshold: 12, pts: 18 },
  { threshold: 9,  pts: 14 },
  { threshold: 6,  pts: 8  },
  { threshold: 3,  pts: 3  },
  { threshold: 1,  pts: 1  },
];

// ─── Bonus Signals ────────────────────────────────────────────────────────────

/**
 * +1 bonus when either front or back shoe was changed before the race.
 * Indicates trainer intervention; marginal but real: +1.1 pp win rate lift.
 */
export const SHOE_CHANGED_BONUS = 1;

/**
 * Driver upgrade bonus — REMOVED (8.8 % win rate vs 9.1 % baseline, no signal).
 * Kept as 0 for backwards compatibility with ScoreBreakdown display.
 */
export const DRIVER_UPGRADE_BONUS = 0;
export const DRIVER_UPGRADE_WIN_PCT_THRESHOLD = 13;
export const DRIVER_UPGRADE_MIN_STARTS = 20;

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
  kmTimeRank: KM_TIME_RANK_POINTS,
  recordPlace: RECORD_PLACE_POINTS,
  conditionForm: CONDITION_FORM_SCORE_POINTS,
  shoeChangedBonus: SHOE_CHANGED_BONUS,
} as const;
