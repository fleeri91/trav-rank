"use client";

import { useMemo } from "react";
import { Bar, BarChart, Cell, XAxis, YAxis } from "recharts";

import { useGame, type RaceWithScores } from "@/lib/queries";
import { type StartScore } from "@/lib/scoring";
import { GAME_COLORS } from "@/lib/game-colors";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ChartContainer, type ChartConfig } from "@/components/ui/chart";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// ─── chart config ─────────────────────────────────────────────────────────────

const MAX_SCORE = 101; // OR14+FS14+CF18+SP12+EP6+HW5+KR5+DW8+TW6+PP5+RP3+GC5

const chartConfig = {
  pct: { label: "Score %" },
} satisfies ChartConfig;

function barColor(pct: number): string {
  if (pct >= 70) return "var(--chart-2)"; // green
  if (pct >= 50) return "var(--chart-3)"; // blue
  if (pct >= 35) return "var(--chart-4)"; // yellow
  return "var(--chart-1)"; // red
}

// ─── custom y-axis tick with badge ───────────────────────────────────────────

function makeYTick(color: string) {
  return function YTick({
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
      <foreignObject
        x={fo_x}
        y={(y ?? 0) - fo_h / 2}
        width={fo_w}
        height={fo_h}
      >
        <div className="flex h-full items-center gap-1.5 overflow-hidden ml-1">
          <Badge
            className="shrink-0 rounded-full h-6 w-6 flex items-center justify-center border-0 text-white"
            style={{ background: color }}
          >
            {startNum}
          </Badge>
          <span className="truncate text-xs text-foreground">{horseName}</span>
        </div>
      </foreignObject>
    );
  };
}

// ─── per-race chart ───────────────────────────────────────────────────────────

function RaceRank({
  scores,
  color,
}: {
  scores: StartScore[] | undefined;
  color: string;
}) {
  const YTick = useMemo(() => makeYTick(color), [color]);

  const chartData = useMemo(
    () =>
      [...(scores ?? [])]
        .filter((s) => !s.scratched)
        .sort((a, b) => b.total - a.total)
        .map((s) => ({
          ...s,
          label: `${s.startNumber} ${s.horseName}`,
          pct: Math.round((s.total / MAX_SCORE) * 100),
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
            tick={<YTick />}
            tickLine={false}
            axisLine={false}
          />
          {/** 
          <Tooltip
            content={<ScoreTooltip />}
            cursor={{ fill: "transparent" }}
          />
          */}
          <Bar dataKey="pct" radius={[0, 4, 4, 0]} maxBarSize={24}>
            {chartData.map((entry) => (
              <Cell key={entry.startId} fill={barColor(entry.pct)} />
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

  const color = GAME_COLORS[data?.type ?? ""] ?? "var(--primary)";

  const racesWithScores: RaceWithScores[] = data?.races ?? [];

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
      <Tabs defaultValue={racesWithScores[0]?.id} className="flex-col">
        <TabsList className="flex-wrap h-auto gap-1 mb-4">
          {racesWithScores.map((race, index) => (
            <TabsTrigger key={race.id} value={race.id}>
              {data.type} : {index + 1}
            </TabsTrigger>
          ))}
        </TabsList>

        {racesWithScores.map((race) => (
          <TabsContent key={race.id} value={race.id}>
            <div className="mb-2">
              <p className="text-sm font-medium">{race.name}</p>
              <p className="text-xs text-muted-foreground">
                {race.distance} m · {race.startMethod} · {race.track?.condition}
              </p>
            </div>
            <RaceRank scores={race.scores} color={color} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
