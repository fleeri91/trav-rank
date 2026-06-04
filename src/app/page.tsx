import { DateSelector } from "@/components/common/date-selector"
import { DayGames } from "@/components/common/day-games"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <DateSelector />
      <main className="mx-auto w-full max-w-2xl flex-1">
        <DayGames />
      </main>
    </div>
  )
}
