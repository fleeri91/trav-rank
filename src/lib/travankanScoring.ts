import type { Race, Start } from "@/types/ATG/Game";
import type { RecordResult } from "@/types/ATG/Record";
import {
  TA_ODDS,
  TA_EARNINGS_PER_START,
  TA_HORSE_WIN_PCT,
  TA_FIRST_PRIZE,
  TA_EARNINGS_TOTAL,
  TA_BEST_TIME,
  TA_DRIVER_EARNINGS_PER_START,
  TA_DRIVER_WIN_PCT,
  TA_POST_AUTO,
  TA_POST_AUTO_12_PLUS,
  TA_POST_VOLTE,
  TA_HANDICAP,
  TA_PLACINGS,
  TA_PLACINGS_SAME_SHOES,
  TA_PLACINGS_BACK_ROW,
  TA_SHOES,
} from "@/lib/travankanPoints";

/**
 * Travankan-style rank points. Columns that need data ATG's start API does not
 * provide (driver/trainer 21-day form, driver win % at track, sectional times,
 * and the unidentified "V75" column) are not included — see
 * docs/travankan-poangsystem.md.
 */
export interface TravankanBreakdown {
  post: number;         // Spår
  handicap: number;     // Till
  placings: number;     // Plc
  placingsSameShoes: number; // AS
  placingsBackRow: number;   // Bsp
  shoes: number;        // Skor
  odds: number;         // Odds
  earningsPerStart: number;  // H$
  horseWinPct: number;  // HV%
  firstPrize: number;   // Pris
  earningsTotal: number;     // M$
  bestTime: number;     // Tid
  driverEarningsPerStart: number; // K$
  driverWinPct: number; // KV%
}

export interface TravankanScore {
  startId: string;
  horseName: string;
  startNumber: number;
  postPosition: number;
  scratched: boolean;
  total: number;
  breakdown: TravankanBreakdown;
}

const EMPTY: TravankanBreakdown = {
  post: 0, handicap: 0, placings: 0, placingsSameShoes: 0, placingsBackRow: 0,
  shoes: 0, odds: 0, earningsPerStart: 0, horseWinPct: 0, firstPrize: 0,
  earningsTotal: 0, bestTime: 0, driverEarningsPerStart: 0, driverWinPct: 0,
};

// ─── helpers ─────────────────────────────────────────────────────────────────

type YearStats = { starts?: number; earnings?: number; winPercentage?: number; placement?: Record<string, number> };

function started(r: RecordResult): boolean {
  return !r.scratched;
}

function placePoints(records: RecordResult[], points: Record<number, number>): number {
  return records.reduce((sum, r) => sum + (points[Number(r.place)] ?? 0), 0);
}

function kmSeconds(r: RecordResult): number | null {
  const t = r.kmTime;
  if (!t || t.seconds === undefined || t.seconds === null) return null;
  return (t.minutes ?? 1) * 60 + t.seconds + (t.tenths ?? 0) / 10;
}

function distCategory(meters: number): "short" | "medium" | "long" {
  if (meters <= 1800) return "short";
  if (meters <= 2400) return "medium";
  return "long";
}

/**
 * Award table points to the best horses. `value` returns null to exclude a
 * horse; `tieBreak` orders equal values (lower = better).
 */
function rankPoints(
  starts: Start[],
  value: (s: Start) => number | null,
  table: readonly number[],
  higherIsBetter: boolean,
  tieBreak: (s: Start) => number = (s) => s.number,
): Map<string, number> {
  const ranked = starts
    .map((s) => ({ s, v: value(s) }))
    .filter((x): x is { s: Start; v: number } => x.v !== null && Number.isFinite(x.v))
    .sort((a, b) => (higherIsBetter ? b.v - a.v : a.v - b.v) || tieBreak(a.s) - tieBreak(b.s));
  const out = new Map<string, number>();
  ranked.forEach(({ s }, i) => out.set(s.id, table[i] ?? 0));
  return out;
}

function driverTwoYears(start: Start, year: number) {
  const years = (start.driver?.statistics?.years ?? {}) as unknown as Record<string, YearStats>;
  let starts = 0, wins = 0, earnings = 0;
  for (const y of [String(year), String(year - 1)]) {
    const v = years[y];
    if (!v) continue;
    const n = v.starts ?? 0;
    starts += n;
    earnings += v.earnings ?? 0;
    wins += v.placement?.["1"] ?? Math.round(((v.winPercentage ?? 0) * n) / 10000);
  }
  return { starts, wins, earnings };
}

function currentShoes(start: Start, records: RecordResult[]): { front: boolean; back: boolean } {
  const shoes = start.horse.shoes;
  if (shoes?.reported && shoes.front && shoes.back) {
    return { front: shoes.front.hasShoe, back: shoes.back.hasShoe };
  }
  // Not reported: assume unchanged since the last start.
  const last = records[0]?.start?.horse?.shoes;
  return { front: last?.front ?? true, back: last?.back ?? true };
}

function shoePoints(start: Start): number {
  const s = start.horse.shoes;
  if (!s?.reported || !s.front || !s.back) return 0;
  const key = [s.front.hasShoe, !!s.front.changed, s.back.hasShoe, !!s.back.changed]
    .map((b) => (b ? "1" : "0"))
    .join("");
  return TA_SHOES[key] ?? 0;
}

// ─── main export ─────────────────────────────────────────────────────────────

/**
 * @param race       ATG race with starts (game endpoint, incl. pools/odds).
 * @param recordsFor Unfiltered result records per start number, newest first.
 */
export function scoreRaceTravankan(
  race: Race,
  recordsFor: (startNumber: number) => RecordResult[],
): TravankanScore[] {
  const raceDate = race.date ?? race.startTime?.slice(0, 10) ?? "";
  const year = Number(raceDate.slice(0, 4)) || new Date().getFullYear();
  const active = race.starts.filter((s) => !s.scratched && !s.out);

  // Only records from before this race, excluding scratched starts.
  const hist = new Map<string, RecordResult[]>(
    active.map((s) => [
      s.id,
      recordsFor(s.number).filter((r) => (!raceDate || r.date < raceDate) && started(r)),
    ]),
  );
  const recs = (s: Start) => hist.get(s.id) ?? [];

  const odds = rankPoints(active, (s) => s.pools?.vinnare?.odds || null, TA_ODDS, false);
  const eps = rankPoints(active, (s) => s.horse.statistics?.life?.earningsPerStart || null, TA_EARNINGS_PER_START, true);
  const hwp = rankPoints(
    active,
    (s) => (s.horse.statistics?.life?.starts ? s.horse.statistics.life.winPercentage ?? 0 : null),
    TA_HORSE_WIN_PCT,
    true,
  );
  const earnTotal = rankPoints(active, (s) => s.horse.statistics?.life?.earnings || null, TA_EARNINGS_TOTAL, true);
  const prize = rankPoints(
    active,
    (s) => {
      const p = recs(s).map((r) => r.race?.firstPrize ?? 0).filter((v) => v > 0).slice(0, 4);
      return p.length ? p.reduce((a, b) => a + b, 0) / p.length : null;
    },
    TA_FIRST_PRIZE,
    true,
  );

  // Best time: same start method + distance category, all time. Ties → most recent.
  const bestTime = new Map<string, { secs: number; date: string }>();
  for (const s of active) {
    const cat = distCategory(s.distance || race.distance);
    for (const r of recs(s)) {
      if (r.race?.startMethod !== race.startMethod) continue;
      if (distCategory(r.start?.distance ?? 0) !== cat) continue;
      const secs = kmSeconds(r);
      if (secs === null) continue;
      const cur = bestTime.get(s.id);
      if (!cur || secs < cur.secs || (secs === cur.secs && r.date > cur.date)) {
        bestTime.set(s.id, { secs, date: r.date });
      }
    }
  }
  const time = rankPoints(
    active,
    (s) => bestTime.get(s.id)?.secs ?? null,
    TA_BEST_TIME,
    false,
    (s) => -Number((bestTime.get(s.id)?.date ?? "").replace(/-/g, "")),
  );

  const drv = new Map(active.map((s) => [s.id, driverTwoYears(s, year)]));
  const dEps = rankPoints(active, (s) => { const d = drv.get(s.id)!; return d.starts ? d.earnings / d.starts : null; }, TA_DRIVER_EARNINGS_PER_START, true);
  const dWin = rankPoints(active, (s) => { const d = drv.get(s.id)!; return d.starts ? d.wins / d.starts : null; }, TA_DRIVER_WIN_PCT, true);

  return race.starts.map((start): TravankanScore => {
    const base = {
      startId: start.id,
      horseName: start.horse.name,
      startNumber: start.number,
      postPosition: start.postPosition,
    };
    if (start.scratched || start.out) {
      return { ...base, scratched: true, total: 0, breakdown: { ...EMPTY } };
    }

    const r = recs(start);
    const isAuto = race.startMethod === "auto";

    const post = isAuto
      ? (start.number >= 12 ? TA_POST_AUTO_12_PLUS : TA_POST_AUTO[start.number] ?? 0)
      : TA_POST_VOLTE[start.postPosition] ?? 0;

    const handicap = TA_HANDICAP[(start.distance ?? race.distance) - race.distance] ?? 0;

    const shoesNow = currentShoes(start, r);
    const sameShoes = r
      .filter((x) => !!x.start?.horse?.shoes?.front === shoesNow.front && !!x.start?.horse?.shoes?.back === shoesNow.back)
      .slice(0, TA_PLACINGS_SAME_SHOES.window);

    const backRow = r.slice(0, TA_PLACINGS_BACK_ROW.window).filter((x) => {
      const pp = x.start?.postPosition ?? 0;
      return x.race?.startMethod === "auto"
        ? pp >= TA_PLACINGS_BACK_ROW.minPostAuto
        : pp >= TA_PLACINGS_BACK_ROW.minPostVolte;
    });

    const breakdown: TravankanBreakdown = {
      post,
      handicap,
      placings: placePoints(r.slice(0, TA_PLACINGS.window), TA_PLACINGS.points),
      placingsSameShoes: placePoints(sameShoes, TA_PLACINGS_SAME_SHOES.points),
      placingsBackRow: placePoints(backRow, TA_PLACINGS_BACK_ROW.points),
      shoes: shoePoints(start),
      odds: odds.get(start.id) ?? 0,
      earningsPerStart: eps.get(start.id) ?? 0,
      horseWinPct: hwp.get(start.id) ?? 0,
      firstPrize: prize.get(start.id) ?? 0,
      earningsTotal: earnTotal.get(start.id) ?? 0,
      bestTime: time.get(start.id) ?? 0,
      driverEarningsPerStart: dEps.get(start.id) ?? 0,
      driverWinPct: dWin.get(start.id) ?? 0,
    };

    const total = Object.values(breakdown).reduce((a, b) => a + b, 0);
    return { ...base, scratched: false, total, breakdown };
  });
}
