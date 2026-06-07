/**
 * Points map for scoring each horse in a race.
 * Derived from analysis of 630 completed V85 races (7 703 starts).
 * Total max score: 104 pts + 1 bonus pt.
 *
 * All rank-based tables use 1-based indexing (index 0 is unused/fallback),
 * except RECORD_PLACE_POINTS where index 0 = DQ (place=0).
 * All win-percentage thresholds use actual % values — divide raw
 * `winPercentage` fields (stored as integer × 100) by 100 before comparing.
 *
 * Form score formula (Group B):
 *   score = Σ placeScore(records[i].place) × recencyWeight[i]   for i in 0..4
 *   where placeScore: 1st=5, 2nd=3, 3rd=2, 4th=1, 5th+=0, galloped=0
 *   and   recencyWeight = [1.0, 0.85, 0.70, 0.55, 0.40]
 *
 * Condition wins (Group H):
 *   Count of wins in start.records[] filtered to the same distance category
 *   (short ≤1800 m / medium ≤2400 m / long >2400 m) AND same startMethod.
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

// ─── Group G · Record Quality at Matching Conditions · 11 pts max ────────────

/**
 * Km-time rank within the race field, using each horse's personal best
 * (horse.statistics.life.records) at the same distance category + startMethod.
 * Rank 1 = fastest recorded km-time. Horses with no matching record score 0.
 * Index 0 is unused; index 6+ are clamped to 1 pt.
 *
 * Rank 1 wins 13.6 % of races; rank 8 wins 6.2 % — a 2.2× spread.
 */
export const KM_TIME_RANK_POINTS = [0, 8, 6, 4, 3, 2, 1] as const;

/**
 * Place achieved when the horse's personal best km-time was set at the current
 * distance category + startMethod.
 *
 * Index = finishing place (0 = DQ/galloped, 1 = won, 2–3 = placed, 4+ = field).
 * Index 4 is the last entry; values 4 and above are clamped to 1 pt.
 *
 * Place 1 wins 11.5 % of races; DQ wins only 5.1 %.
 */
export const RECORD_PLACE_POINTS = [0, 3, 2, 2, 1] as const;

// ─── Group H · Condition-Specific Form Score · 12 pts max ────────────────────

/**
 * Weighted form score using only starts from start.records[] that match the
 * current race's distance category AND startMethod — the same formula as the
 * general form score (Group B), but filtered to relevant conditions.
 *
 * score = Σ placeScore(r.place) × recencyWeight[i]   for i in 0..4
 *   where placeScore: 1st=5, 2nd=3, 3rd=2, 4th=1, 5th+=0, galloped=0
 *   and   recencyWeight = [1.0, 0.85, 0.70, 0.55, 0.40]
 *
 * Captures consistent near-misses and form continuity at the exact conditions,
 * not only wins. Capped at 12 pts (vs 15 for general form) to avoid
 * double-weighting.
 *
 * Score of 0 (no condition starts, or all failures) → 0 pts.
 */
export const CONDITION_FORM_SCORE_POINTS: { threshold: number; pts: number }[] = [
  { threshold: 12, pts: 12 },
  { threshold: 9,  pts: 10 },
  { threshold: 6,  pts: 7  },
  { threshold: 3,  pts: 4  },
  { threshold: 1,  pts: 1  },
];

// ─── Bonus Signals ────────────────────────────────────────────────────────────

/**
 * +1 bonus when either front or back shoe was changed before the race.
 * Indicates trainer intervention; marginal but real: +1.1 pp win rate lift.
 */
export const SHOE_CHANGED_BONUS = 1;

/**
 * +2 bonus when connections have deliberately booked a better driver.
 *
 * Conditions (all must hold):
 *   1. The driver today is different from the driver in the most recent start.
 *   2. No `originalDriver` field — this is a planned change, not a late sub.
 *   3. Current driver has ≥ 15 % win rate and ≥ 20 starts this season.
 *
 * Rationale: a trainer who books a top driver for a specific race is signalling
 * confidence. Captures cases like a regular journeyman replaced by an elite
 * name ahead of a target race.
 */
export const DRIVER_UPGRADE_BONUS = 2;
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
  driverUpgradeBonus: DRIVER_UPGRADE_BONUS,
} as const;
