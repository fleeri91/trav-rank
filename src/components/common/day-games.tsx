"use client"

import Link from "next/link"
import { format, parseISO } from "date-fns"
import { ChevronRight, Zap } from "lucide-react"

import { useDay } from "@/lib/queries"
import { useCalendarStore } from "@/stores/useCalendar"
import { type Game, type Track } from "@/types/ATG/CalendarDay"

// ─── config ───────────────────────────────────────────────────────────────────

const GAME_ORDER = ["V86", "V85", "GS75", "V65", "V64", "V5", "V4", "dd", "ld"]

const GAME_META: Record<string, { label: string; textClass: string; borderClass: string }> = {
  V86:  { label: "V86",           textClass: "text-primary",   borderClass: "border-l-primary" },
  V85:  { label: "V85",           textClass: "text-primary",   borderClass: "border-l-primary" },
  GS75: { label: "GS75",          textClass: "text-primary",   borderClass: "border-l-primary" },
  V65:  { label: "V65",           textClass: "text-secondary", borderClass: "border-l-secondary" },
  V64:  { label: "V64",           textClass: "text-secondary", borderClass: "border-l-secondary" },
  V5:   { label: "V5",            textClass: "text-accent",    borderClass: "border-l-accent" },
  V4:   { label: "V4",            textClass: "text-accent",    borderClass: "border-l-accent" },
  dd:   { label: "Dagens Dubbel", textClass: "text-accent",    borderClass: "border-l-accent" },
  ld:   { label: "Lunchdubbeln",  textClass: "text-accent",    borderClass: "border-l-accent" },
}

const FALLBACK_META = { label: "", textClass: "text-foreground", borderClass: "border-l-border" }

// ─── helpers ──────────────────────────────────────────────────────────────────

function sortGameTypes(entries: [string, Game[]][]) {
  return [...entries].sort(([a], [b]) => {
    const ai = GAME_ORDER.indexOf(a)
    const bi = GAME_ORDER.indexOf(b)
    if (ai === -1 && bi === -1) return a.localeCompare(b)
    if (ai === -1) return 1
    if (bi === -1) return -1
    return ai - bi
  })
}

function formatAmount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(".0", "")}M`
  if (n >= 1_000) return `${Math.round(n / 1_000)}k`
  return String(n)
}

function statusDotClass(status: string) {
  const s = status.toLowerCase()
  if (s === "open" || s === "active") return "bg-secondary animate-pulse"
  if (s === "results" || s === "finished") return "bg-muted-foreground/50"
  if (s === "cancelled") return "bg-destructive"
  return "bg-muted-foreground/30"
}

// ─── sub-components ───────────────────────────────────────────────────────────

function SectionHeader({ gameType, count }: { gameType: string; count: number }) {
  const meta = GAME_META[gameType] ?? { ...FALLBACK_META, label: gameType.toUpperCase() }
  return (
    <div className={`flex items-baseline gap-3 border-l-4 bg-card px-5 py-3 mt-px ${meta.borderClass}`}>
      <span className={`text-xl font-bold ${meta.textClass}`}>{meta.label}</span>
      <span className="text-xs text-muted-foreground">
        {count} {count === 1 ? "round" : "rounds"}
      </span>
    </div>
  )
}

function GameRow({ game, trackMap }: { game: Game; trackMap: Map<number, Track> }) {
  const startTime = format(parseISO(game.startTime), "HH:mm")
  const trackNames = game.tracks.map((id) => trackMap.get(id)?.name ?? id).join("  ·  ")
  const jackpot = game.jackpotAmount > 0 ? formatAmount(game.jackpotAmount) : null
  const estimated = !jackpot && game.estimatedJackpot > 50_000 ? formatAmount(game.estimatedJackpot) : null

  return (
    <Link
      href={`/game/${game.id}`}
      className="group flex items-center gap-5 border-b px-5 py-4 hover:bg-muted transition-colors"
    >
      <span className="w-10 shrink-0 font-mono text-sm tabular-nums text-muted-foreground">
        {startTime}
      </span>

      <span className="min-w-0 flex-1 truncate text-sm font-medium">{trackNames}</span>

      {jackpot && (
        <span className="flex shrink-0 items-center gap-1 text-xs font-bold text-primary">
          <Zap className="size-3" />
          {jackpot} kr
        </span>
      )}
      {estimated && (
        <span className="shrink-0 text-xs text-muted-foreground">est. {estimated} kr</span>
      )}

      <span
        className={`size-2 shrink-0 rounded-full ${statusDotClass(game.status)}`}
        title={game.status}
      />

      <ChevronRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground" />
    </Link>
  )
}

function SkeletonSection() {
  return (
    <div>
      <div className="border-l-4 border-l-muted bg-card px-5 py-3 mt-px">
        <div className="h-5 w-12 animate-pulse bg-muted" />
      </div>
      {[1, 2].map((i) => (
        <div key={i} className="flex items-center gap-5 border-b px-5 py-4">
          <div className="h-4 w-10 animate-pulse bg-muted" />
          <div className="h-4 flex-1 animate-pulse bg-muted" />
          <div className="size-2 animate-pulse rounded-full bg-muted" />
          <div className="size-4 animate-pulse bg-muted" />
        </div>
      ))}
    </div>
  )
}

// ─── main ─────────────────────────────────────────────────────────────────────

export function DayGames() {
  const { selectedDate } = useCalendarStore()
  const { data, isLoading, isError } = useDay(selectedDate)

  if (isLoading) {
    return (
      <div>
        <SkeletonSection />
        <SkeletonSection />
        <SkeletonSection />
      </div>
    )
  }

  if (isError || !data) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-destructive">
        Failed to load games.
      </div>
    )
  }

  const entries = Object.entries(data.games ?? {})

  if (!entries.length) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
        No games scheduled for this day.
      </div>
    )
  }

  const trackMap = new Map(data.tracks.map((t) => [t.id, t]))
  const sorted = sortGameTypes(entries)

  return (
    <div>
      {sorted.map(([gameType, games]) => (
        <div key={gameType}>
          <SectionHeader gameType={gameType} count={games.length} />
          {games.map((game) => (
            <GameRow key={game.id} game={game} trackMap={trackMap} />
          ))}
        </div>
      ))}
    </div>
  )
}
