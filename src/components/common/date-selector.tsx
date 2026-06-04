"use client"

import * as React from "react"
import { format, isToday, parseISO } from "date-fns"
import { ChevronLeft, ChevronRight, ChevronDown } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useCalendarStore } from "@/stores/useCalendar"

export function DateSelector() {
  const { selectedDate, setSelectedDate, setPreviousDate, setNextDate } = useCalendarStore()
  const [open, setOpen] = React.useState(false)
  const parsed = parseISO(selectedDate)
  const today = isToday(parsed)

  function handleSelect(date: Date | undefined) {
    if (!date) return
    setSelectedDate(format(date, "yyyy-MM-dd"))
    setOpen(false)
  }

  return (
    <header className="flex w-full items-stretch border-b bg-card">
      <button
        onClick={() => setPreviousDate(selectedDate)}
        className="flex items-center px-6 hover:bg-muted transition-colors"
        aria-label="Previous day"
      >
        <ChevronLeft className="size-5" />
      </button>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger className="flex flex-1 flex-col items-center justify-center gap-1 py-5 hover:bg-muted transition-colors">
          <span className="font-mono text-[10px] tracking-[0.25em] text-muted-foreground uppercase">
            {today ? "TODAY · " : ""}{format(parsed, "EEEE").toUpperCase()}
          </span>
          <span className="flex items-center gap-2 text-2xl font-bold">
            {format(parsed, "d MMMM yyyy").toUpperCase()}
            <ChevronDown className="size-4 text-muted-foreground" />
          </span>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="center">
          <Calendar
            mode="single"
            selected={parsed}
            onSelect={handleSelect}
            defaultMonth={parsed}
          />
        </PopoverContent>
      </Popover>

      <button
        onClick={() => setNextDate(selectedDate)}
        className="flex items-center px-6 hover:bg-muted transition-colors"
        aria-label="Next day"
      >
        <ChevronRight className="size-5" />
      </button>
    </header>
  )
}
