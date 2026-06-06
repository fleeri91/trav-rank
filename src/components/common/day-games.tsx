"use client"

import Link from "next/link"
import { format, parseISO } from "date-fns"

import { useDay } from "@/lib/queries"
import { useCalendarStore } from "@/stores/useCalendar"
import { GAME_COLORS } from "@/lib/game-colors"
import { type Game } from "@/types/ATG/CalendarDay"

const COUNTRY_FLAGS: Record<string, string> = {
  SE: "🇸🇪",
  NO: "🇳🇴",
  FI: "🇫🇮",
  FR: "🇫🇷",
  DK: "🇩🇰",
  DE: "🇩🇪",
  IT: "🇮🇹",
  AU: "🇦🇺",
  US: "🇺🇸",
  GB: "🇬🇧",
}

const GAME_ORDER = ["V86", "V85", "GS75", "V65", "V64", "V5", "V4", "V3", "dd", "ld"]


function GameBadge({ game, gameType }: { game: Game; gameType: string }) {
  return (
    <Link
      href={`/game/${game.id}`}
      className="flex h-10 w-10 items-center justify-center rounded text-xs font-bold text-white uppercase select-none transition-all hover:-translate-y-0.5 hover:brightness-110"
      style={{ background: GAME_COLORS[gameType] ?? "var(--muted-foreground)" }}
    >
      {gameType}
    </Link>
  )
}

function SkeletonRows() {
  return (
    <>
      {[3, 2, 4, 2].map((count, i) => (
        <tr key={i} className="border-b">
          <td className="w-48 px-5 py-4">
            <div className="flex flex-col gap-1.5">
              <div className="h-4 w-32 animate-pulse rounded bg-muted" />
              <div className="h-3 w-12 animate-pulse rounded bg-muted" />
            </div>
          </td>
          <td className="px-5 py-4">
            <div className="flex gap-2">
              {Array.from({ length: count }).map((_, j) => (
                <div key={j} className="h-10 w-10 animate-pulse rounded bg-muted" />
              ))}
            </div>
          </td>
        </tr>
      ))}
    </>
  )
}

export function DayGames() {
  const { selectedDate } = useCalendarStore()
  const { data, isLoading, isError } = useDay(selectedDate)

  if (isLoading) {
    return (
      <table className="w-full">
        <tbody>
          <SkeletonRows />
        </tbody>
      </table>
    )
  }

  if (isError || !data) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-destructive">
        Failed to load games.
      </div>
    )
  }

  if (!data.tracks.length) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
        No games scheduled for this day.
      </div>
    )
  }

  return (
    <table className="w-full">
      <tbody>
        {data.tracks.map((track) => {
          const flag = COUNTRY_FLAGS[track.countryCode] ?? ""
          const startTime = format(parseISO(track.startTime), "HH:mm")

          const badges = GAME_ORDER.flatMap((gameType) =>
            (data.games[gameType] ?? [])
              .filter((game) => game.tracks.includes(track.id))
              .map((game) => (
                <GameBadge key={`${game.id}-${gameType}`} game={game} gameType={gameType} />
              ))
          )

          if (!badges.length) return null

          return (
            <tr key={track.id} className="border-b">
              <td className="w-48 px-5 py-4 align-middle">
                <div className="flex flex-col gap-0.5">
                  <span className="flex items-center gap-1.5 text-sm font-semibold">
                    {flag && <span>{flag}</span>}
                    {track.name}
                  </span>
                  <span className="font-mono text-xs text-muted-foreground">{startTime}</span>
                </div>
              </td>
              <td className="px-5 py-4 align-middle">
                <div className="flex flex-wrap gap-2">
                  {badges}
                </div>
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}
