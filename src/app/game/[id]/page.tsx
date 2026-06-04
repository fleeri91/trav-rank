import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import Rank from "@/components/sections/rank/rank"

export default async function GamePage({ params }: PageProps<"/game/[id]">) {
  const { id } = await params

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center border-b bg-card px-5 py-4">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ChevronLeft className="size-4" />
          Calendar
        </Link>
      </header>
      <main className="flex-1">
        <Rank gameId={id} />
      </main>
    </div>
  )
}
