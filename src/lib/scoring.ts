import type { RecordResult } from "@/types/ATG/Record";
import type { Start, Race } from "@/types/ATG/Game";
import {
  ODDS_RANK_POINTS,
  FORM_SCORE_POINTS,
  GALLOP_POINTS,
  START_POINTS_RANK_POINTS,
  EARNINGS_PER_START_RANK_POINTS,
  DRIVER_WIN_PCT_POINTS,
  DRIVER_CHANGED_PENALTY,
  TRAINER_WIN_PCT_POINTS,
  HORSE_WIN_PCT_RANK_POINTS,
  POST_POSITION_POINTS,
  SHOE_CHANGED_BONUS,
} from "@/lib/pointsMap";

export interface ScoreBreakdown {
  oddsRank: number;
  formScore: number;
  gallop: number;
  startPoints: number;
  earningsPerStart: number;
  driverWinPct: number;
  driverChanged: number;
  trainerWinPct: number;
  horseWinPct: number;
  postPosition: number;
  shoeChanged: number;
}

export interface StartScore {
  startId: string;
  horseName: string;
  startNumber: number;
  postPosition: number;
  scratched: boolean;
  total: number;
  breakdown: ScoreBreakdown;
}

// ─── helpers ─────────────────────────────────────────────────────────────────

function rankLookup(rank: number, table: readonly number[]): number {
  if (rank <= 0) return 0;
  const idx = Math.min(rank, table.length - 1);
  return table[idx] ?? table[table.length - 1] ?? 0;
}

function thresholdLookup(
  value: number,
  table: { threshold: number; pts: number }[]
): number {
  for (const entry of table) {
    if (value >= entry.threshold) return entry.pts;
  }
  return 0;
}

function computeFormScore(records: RecordResult[]): number {
  const weights = [1.0, 0.85, 0.7, 0.55, 0.4];
  return records.slice(0, 5).reduce((sum, rec, i) => {
    if (rec.galloped || rec.disqualified) return sum;
    const place = parseInt(String(rec.place), 10);
    const pts =
      place === 1 ? 5 : place === 2 ? 3 : place === 3 ? 2 : place === 4 ? 1 : 0;
    return sum + pts * weights[i];
  }, 0);
}

// Bonus only when a shoe is removed for the first time AND the horse has a
// good win rate with shoes on (all prior records, since this is their first
// shoe-off start). "Good" = ≥15 % win rate across those records.
function computeShoeBonus(start: Start, records: RecordResult[]): number {
  const shoes = start.horse.shoes;
  const frontRemoved = !!(shoes?.front?.changed && !shoes?.front?.hasShoe);
  const backRemoved  = !!(shoes?.back?.changed  && !shoes?.back?.hasShoe);

  if (!frontRemoved && !backRemoved) return 0;

  // Not the first time without that shoe → no bonus
  if (frontRemoved && records.some((r) => r.start?.horse?.shoes?.front === false)) return 0;
  if (backRemoved  && records.some((r) => r.start?.horse?.shoes?.back  === false)) return 0;

  // Require proven winning form with shoes before granting the bonus
  if (records.length === 0) return 0;
  const winRate = records.filter((r) => String(r.place) === "1").length / records.length;
  if (winRate < 0.15) return 0;

  return SHOE_CHANGED_BONUS;
}

function getPoolOdds(start: Start): number {
  return start.pools?.vinnare?.odds ?? 999_999;
}


function yearStats(
  stats: { years: Record<string, { winPercentage: number; starts: number }> } | undefined,
  year: string
): { winPercentage: number; starts: number } | undefined {
  return (stats?.years as Record<string, { winPercentage: number; starts: number }>)?.[year];
}

type RankMap = Map<string, number>;

function buildRankMap(
  active: Start[],
  getValue: (s: Start) => number,
  ascending: boolean
): RankMap {
  const sorted = [...active].sort((a, b) =>
    ascending ? getValue(a) - getValue(b) : getValue(b) - getValue(a)
  );
  const map: RankMap = new Map();
  sorted.forEach((s, i) => map.set(s.id, i + 1));
  return map;
}

// ─── main export ─────────────────────────────────────────────────────────────

export function scoreRace(race: Race, currentYear: string): StartScore[] {
  const active = race.starts.filter((s) => !s.scratched && !s.out);

  const oddsRankMap = buildRankMap(active, getPoolOdds, true);
  const spRankMap = buildRankMap(
    active,
    (s) => s.horse.statistics?.life?.startPoints ?? 0,
    false
  );
  const epsRankMap = buildRankMap(
    active,
    (s) => s.horse.statistics?.life?.earningsPerStart ?? 0,
    false
  );
  const hwpRankMap = buildRankMap(
    active,
    (s) => s.horse.statistics?.life?.winPercentage ?? 0,
    false
  );

  const smKey: "volte" | "auto" =
    race.startMethod === "volte" ? "volte" : "auto";
  const ppTable = POST_POSITION_POINTS[smKey];

  return race.starts.map((start): StartScore => {
    if (start.scratched || start.out) {
      return {
        startId: start.id,
        horseName: start.horse.name,
        startNumber: start.number,
        postPosition: start.postPosition,
        scratched: true,
        total: 0,
        breakdown: {
          oddsRank: 0, formScore: 0, gallop: 0,
          startPoints: 0, earningsPerStart: 0, driverWinPct: 0,
          driverChanged: 0, trainerWinPct: 0, horseWinPct: 0,
          postPosition: 0, shoeChanged: 0,
        },
      };
    }

    const records = start.records ?? [];

    // A – Market
    const oddsRank = rankLookup(oddsRankMap.get(start.id) ?? 99, ODDS_RANK_POINTS);

    // B – Form
    const formRaw = computeFormScore(records);
    const formPts = thresholdLookup(formRaw, FORM_SCORE_POINTS);
    // Only penalise a gallop that ended in disqualification AND occurred from
    // the same start method and post position as today's race — a gallop in a
    // different context (e.g. volte vs auto, or different lane) is not a
    // reliable signal for this specific start.
    const hasRelevantGallop = records.slice(0, 5).some(
      (r) =>
        r.galloped &&
        r.disqualified &&
        r.race.startMethod === race.startMethod &&
        r.start.postPosition === start.postPosition
    );
    const gallopPts = hasRelevantGallop ? GALLOP_POINTS.hasGallop : GALLOP_POINTS.clean;

    // C – Class
    const spPts = rankLookup(spRankMap.get(start.id) ?? 99, START_POINTS_RANK_POINTS);
    const epsPts = rankLookup(epsRankMap.get(start.id) ?? 99, EARNINGS_PER_START_RANK_POINTS);

    // D – Personnel
    const driverWp = (yearStats(start.driver.statistics as any, currentYear)?.winPercentage ?? 0) / 100;
    const driverWpPts = thresholdLookup(driverWp, DRIVER_WIN_PCT_POINTS);
    const driverChangedPts = start.originalDriver ? DRIVER_CHANGED_PENALTY : 0;

    const trainerWp = (yearStats(start.horse.trainer.statistics as any, currentYear)?.winPercentage ?? 0) / 100;
    const trainerWpPts = thresholdLookup(trainerWp, TRAINER_WIN_PCT_POINTS);

    // E – Career win%
    const hwpPts = rankLookup(hwpRankMap.get(start.id) ?? 99, HORSE_WIN_PCT_RANK_POINTS);

    // F – Post position
    const pp = Math.min(start.postPosition, ppTable.length - 1);
    const ppPts = ppTable[pp] ?? 0;

    // Bonus
    const shoePts = computeShoeBonus(start, records);

    const breakdown: ScoreBreakdown = {
      oddsRank: oddsRank,
      formScore: formPts,
      gallop: gallopPts,
      startPoints: spPts,
      earningsPerStart: epsPts,
      driverWinPct: driverWpPts,
      driverChanged: driverChangedPts,
      trainerWinPct: trainerWpPts,
      horseWinPct: hwpPts,
      postPosition: ppPts,
      shoeChanged: shoePts,
    };

    const total = Math.max(
      0,
      Object.values(breakdown).reduce((a, b) => a + b, 0)
    );

    return {
      startId: start.id,
      horseName: start.horse.name,
      startNumber: start.number,
      postPosition: start.postPosition,
      scratched: false,
      total,
      breakdown,
    };
  });
}
