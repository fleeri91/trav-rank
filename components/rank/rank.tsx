"use client";

import { useMemo } from "react";
import { Bar, BarChart, Cell, XAxis, YAxis, Tooltip } from "recharts";

import { useGame } from "@/lib/queries";
import { scoreRace, type StartScore } from "@/lib/scoring";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ChartContainer, type ChartConfig } from "@/components/ui/chart";
import { Card } from "../ui/card";
import { Badge } from "@/components/ui/badge";

// ─── chart config ─────────────────────────────────────────────────────────────

const chartConfig = {
  total: { label: "Score" },
} satisfies ChartConfig;

function barColor(total: number): string {
  if (total >= 70) return "var(--chart-2)"; // green
  if (total >= 50) return "var(--chart-3)"; // blue
  if (total >= 35) return "var(--chart-4)"; // yellow
  return "var(--chart-1)"; // red
}

// ─── tooltip ─────────────────────────────────────────────────────────────────

interface TooltipPayload {
  payload: StartScore & { label: string };
}

function ScoreTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: TooltipPayload[];
}) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  const b = d.breakdown;
  return (
    <div className="rounded-lg border bg-background p-3 text-xs shadow-md space-y-1 min-w-48">
      <p className="font-semibold text-sm">
        {d.horseName} (PP {d.postPosition})
      </p>
      <p className="font-bold text-base">Total: {d.total} pts</p>
      <hr className="my-1" />
      <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-muted-foreground">
        <span>Odds rank</span>{" "}
        <span className="text-right font-medium text-foreground">
          {b.oddsRank}
        </span>
        <span>Form score</span>{" "}
        <span className="text-right font-medium text-foreground">
          {b.formScore}
        </span>
        <span>Gallop-free</span>{" "}
        <span className="text-right font-medium text-foreground">
          {b.gallop}
        </span>
        <span>Start points</span>{" "}
        <span className="text-right font-medium text-foreground">
          {b.startPoints}
        </span>
        <span>Earnings/start</span>{" "}
        <span className="text-right font-medium text-foreground">
          {b.earningsPerStart}
        </span>
        <span>Driver win%</span>{" "}
        <span className="text-right font-medium text-foreground">
          {b.driverWinPct}
        </span>
        {b.driverChanged !== 0 && (
          <>
            <span>Driver changed</span>
            <span className="text-right font-medium text-destructive">
              {b.driverChanged}
            </span>
          </>
        )}
        <span>Trainer win%</span>{" "}
        <span className="text-right font-medium text-foreground">
          {b.trainerWinPct}
        </span>
        <span>Career win%</span>{" "}
        <span className="text-right font-medium text-foreground">
          {b.horseWinPct}
        </span>
        <span>Post position</span>{" "}
        <span className="text-right font-medium text-foreground">
          {b.postPosition}
        </span>
        {b.shoeChanged > 0 && (
          <>
            <span>Shoe changed</span>
            <span className="text-right font-medium text-foreground">
              +{b.shoeChanged}
            </span>
          </>
        )}
      </div>
    </div>
  );
}

// ─── custom y-axis tick with badge ───────────────────────────────────────────

function CustomYTick({
  x,
  y,
  payload,
  width,
}: {
  x?: number;
  y?: number;
  payload?: { value: string };
  width?: number;
}) {
  const value = payload?.value ?? "";
  const spaceIdx = value.indexOf(" ");
  const startNum = spaceIdx >= 0 ? value.slice(0, spaceIdx) : value;
  const horseName = spaceIdx >= 0 ? value.slice(spaceIdx + 1) : "";
  const fo_x = (x ?? 0) - (width ?? 0) + 4;
  const fo_w = (width ?? 0) - 8;
  const fo_h = 24;

  return (
    <foreignObject x={fo_x} y={(y ?? 0) - fo_h / 2} width={fo_w} height={fo_h}>
      <div className="flex h-full items-center gap-1.5 overflow-hidden ml-1">
        <Badge className="shrink-0 rounded-full h-6 w-6 flex items-center justify-center">
          {startNum}
        </Badge>
        <span className="truncate text-xs text-foreground">{horseName}</span>
      </div>
    </foreignObject>
  );
}

// ─── per-race chart ───────────────────────────────────────────────────────────

function RaceRank({ scores }: { scores: StartScore[] }) {
  const chartData = useMemo(
    () =>
      [...scores]
        .filter((s) => !s.scratched)
        .sort((a, b) => b.total - a.total)
        .map((s) => ({
          ...s,
          label: `${s.startNumber} ${s.horseName}`,
        })),
    [scores],
  );

  if (!chartData.length) {
    return <p className="text-muted-foreground text-sm p-4">No starters.</p>;
  }

  const barHeight = 32;
  const chartHeight = chartData.length * barHeight + 16;
  const longestName = Math.max(...chartData.map((d) => d.horseName.length));
  const yAxisWidth = Math.min(longestName * 7, 200) + 32; // +32 for badge

  return (
    <Card className="p-4">
      <ChartContainer config={chartConfig} style={{ height: chartHeight }}>
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 0, right: 24, bottom: 0, left: 0 }}
          barCategoryGap={4}
        >
          <XAxis
            type="number"
            domain={[0, 100]}
            tickCount={6}
            tick={{ fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            dataKey="label"
            type="category"
            width={yAxisWidth}
            tick={<CustomYTick />}
            tickLine={false}
            axisLine={false}
          />
          {/** 
          <Tooltip
            content={<ScoreTooltip />}
            cursor={{ fill: "transparent" }}
          />
          */}
          <Bar dataKey="total" radius={[0, 4, 4, 0]} maxBarSize={24}>
            {chartData.map((entry) => (
              <Cell key={entry.startId} fill={barColor(entry.total)} />
            ))}
          </Bar>
        </BarChart>
      </ChartContainer>
    </Card>
  );
}

// ─── main component ───────────────────────────────────────────────────────────

interface RankProps {
  gameId: string;
}

export default function Rank({ gameId }: RankProps) {
  const { data, isLoading, isError } = useGame(gameId);

  const racesWithScores = useMemo(() => {
    if (!data?.races) return [];
    return data.races.map((race) => {
      const year =
        race.date?.slice(0, 4) ?? new Date().getFullYear().toString();
      return { race, scores: scoreRace(race, year) };
    });
  }, [data]);

  if (!gameId) {
    return (
      <div className="flex h-64 items-center justify-center text-muted-foreground text-sm">
        No game selected.
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center text-muted-foreground text-sm">
        Loading…
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex h-64 items-center justify-center text-destructive text-sm">
        Failed to load game data.
      </div>
    );
  }

  return (
    <div className="p-4">
      <Tabs defaultValue={racesWithScores[0]?.race.id} className="flex-col">
        <TabsList className="flex-wrap h-auto gap-1 mb-4">
          {racesWithScores.map(({ race }, index) => (
            <TabsTrigger key={race.id} value={race.id}>
              {data.type} : {index + 1}
            </TabsTrigger>
          ))}
        </TabsList>

        {racesWithScores.map(({ race, scores }) => (
          <TabsContent key={race.id} value={race.id}>
            <div className="mb-2">
              <p className="text-sm font-medium">{race.name}</p>
              <p className="text-xs text-muted-foreground">
                {race.distance} m · {race.startMethod} · {race.track?.condition}
              </p>
            </div>
            <RaceRank scores={scores} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
