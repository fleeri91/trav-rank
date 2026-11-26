/**
 * Travankan default rank points ("standardvikter"), reverse-engineered from
 * travankan.se Rankinformation and verified against ATG data.
 * See docs/travankan-poangsystem.md for method and accuracy per column.
 *
 * Rank tables: index 0 = best horse in the field, only the top 6 score.
 */

// ─── Rank-based columns (top 6 in the field) ─────────────────────────────────

/** Lowest win odds first. */
export const TA_ODDS = [800, 700, 600, 450, 300, 150] as const;
/** Horse life earnings per start. */
export const TA_EARNINGS_PER_START = [600, 500, 400, 300, 200, 100] as const;
/** Horse life win %. Horses with 0 % are ranked too (ties → lowest start number). */
export const TA_HORSE_WIN_PCT = [600, 500, 400, 300, 200, 100] as const;
/** Average first prize of the last 4 started races. */
export const TA_FIRST_PRIZE = [600, 500, 400, 300, 200, 100] as const;
/** Horse life earnings. */
export const TA_EARNINGS_TOTAL = [450, 375, 300, 225, 150, 75] as const;
/** Best km time ever, same start method and distance category. */
export const TA_BEST_TIME = [475, 400, 325, 250, 175, 100] as const;
/** Driver earnings per start, current + previous year. */
export const TA_DRIVER_EARNINGS_PER_START = [475, 400, 325, 250, 175, 100] as const;
/** Driver win %, current + previous year. */
export const TA_DRIVER_WIN_PCT = [425, 350, 275, 200, 125, 50] as const;

// ─── Per-horse columns ───────────────────────────────────────────────────────

/** Post position points. Auto uses start number, volte uses postPosition. */
export const TA_POST_AUTO: Record<number, number> = {
  1: 525, 2: 475, 3: 525, 4: 575, 5: 625, 6: 375,
  7: 300, 8: 125, 9: 350, 10: 375, 11: 250,
};
/** Auto start, post position 12 and higher. */
export const TA_POST_AUTO_12_PLUS = 75;
export const TA_POST_VOLTE: Record<number, number> = {
  1: 650, 2: 450, 3: 525, 4: 400, 5: 250, 6: 375,
  7: 300, 8: 250, 9: 150, 10: 125, 11: 75, 12: 50,
};

/** Distance handicap in metres → points. */
export const TA_HANDICAP: Record<number, number> = { 20: 450, 40: 600, 60: 750 };

/** Placings in the last 6 started races. */
export const TA_PLACINGS = { window: 6, points: { 1: 225, 2: 150, 3: 75 } } as const;
/** Placings in the last 3 started races with the same shoes (front/back) as today. */
export const TA_PLACINGS_SAME_SHOES = { window: 3, points: { 1: 300, 2: 150, 3: 75 } } as const;
/** Placings from a back-row post among the last 6 started races. */
export const TA_PLACINGS_BACK_ROW = {
  window: 6,
  minPostAuto: 9,
  minPostVolte: 8,
  points: { 1: 250, 2: 175, 3: 100 },
} as const;

/**
 * Shoe change vs previous start, keyed by
 * `${frontHasShoe}${frontChanged}${backHasShoe}${backChanged}` as 1/0 digits.
 * Unlisted combinations (no change) score 0.
 */
export const TA_SHOES: Record<string, number> = {
  "1110": -500, // front on, back shod
  "1011": -500, // back on, front shod
  "1111": -1000, // both on
  "0001": -500, // back off when already barefoot in front
  "0101": 1000, // both off
  "0011": -500, // back on, front barefoot
  "0110": 500, // front off, back shod
  "1100": 500, // front on, back barefoot
  "0100": 500, // front off, back barefoot
  "1101": 250, // front on, back off
  "0111": -250, // front off, back on
  "1001": 500, // back off, front shod
};
