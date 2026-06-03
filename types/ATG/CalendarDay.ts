export interface ATGCalendarDayRoot {
  date: string
  tracks: Track[]
  games: Games
}

export interface Track {
  id: number
  name: string
  startTime: string
  races: Race[]
  biggestGameType: string
  sport: string
  countryCode: string
  trackChanged: boolean
}

interface Race {
  id: string
  number: number
  status: string
  startTime: string
}

interface Games {
  [key: string]: Game[]
}

export interface Game {
  id: string
  status: string
  startTime: string
  scheduledStartTime: string
  tracks: number[]
  races: string[]
  jackpotAmount: number
  estimatedJackpot: number
}
