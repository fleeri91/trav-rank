import { NextResponse, NextRequest } from "next/server";
import { ATGGameRoot } from "@/types/ATG/Game";
import { ATGStartRoot } from "@/types/ATG/Start";
import dayjs from "dayjs";

const API_URL = process.env.API_URL;

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Fetch failed: ${res.status} ${url}`);
  return res.json();
}

function isRecentValidRecord(
  record: ATGStartRoot["horse"]["results"]["records"][number],
  sport: string,
) {
  return (
    !record.disqualified &&
    !record.scratched &&
    record.kmTime &&
    !record.kmTime.code &&
    record.race.sport === sport &&
    dayjs(record.date).isAfter(dayjs().subtract(2, "year"))
  );
}

export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");

  try {
    const gameData = await fetchJson<ATGGameRoot>(`${API_URL}/games/${id}`);

    const races = await Promise.all(
      gameData.races.map(async (race) => {
        const raceStarts = await fetchJson<ATGStartRoot[]>(
          `${API_URL}/races/${race.id}/start/`,
        );

        const startsById = Object.fromEntries(
          raceStarts.map((s) => [s.startNumber, s]),
        );

        const starts = race.starts.map((start) => {
          const records = (
            startsById[start.number]?.horse?.results?.records ?? []
          ).filter((record) => isRecentValidRecord(record, race.sport));

          return { ...start, records };
        });

        return { ...race, starts };
      }),
    );

    return NextResponse.json({ ...gameData, races });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
