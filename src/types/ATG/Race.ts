export interface ATGRaceRoot {
  id: string
  name: string
  date: string
  number: number
  distance: number
  startMethod: string
  startTime: string
  scheduledStartTime: string
  prize: string
  terms: string[]
  sport: string
  track: Track
  status: string
  pools: RacePools
  starts: Start[]
  mergedPools: MergedPool[]
}

export interface Track {
  id: number
  name: string
  condition?: string
  countryCode: string
}

export interface RacePools {
  vinnare: Vinnare
  plats: Plats
}

export interface Vinnare {
  '@type': string
  id: string
  status: string
  timestamp: string
  turnover: number
  betType: string
}

export interface Plats {
  '@type': string
  id: string
  status: string
  timestamp: string
  turnover: number
  betType: string
}

export interface MergedPool {
  name: string
  betTypes: string[]
}

export interface Start {
  id: string
  number: number
  postPosition: number
  distance: number
  horse: Horse
  driver: Driver
  pools: StartPools
  result?: Result
  scratched?: boolean // Replaced 'out' with 'scratched' to match previous usage
}

export interface Result {
  victoryMargin?: string
}

export interface Horse {
  id: number
  name: string
  age: number
  sex: string
  record: RaceRecord
  trainer: Trainer
  shoes: Shoes
  sulky: Sulky
  money: number
  color: string
  homeTrack?: HomeTrack
  owner: Owner
  breeder: Breeder
  statistics: HorseStatistics
  pedigree: Pedigree
  nationality?: string
  foreignOwned?: boolean
}

export interface RaceRecord {
  code: string
  startMethod: string
  distance: string
  time: Time
}

export interface Time {
  minutes: number
  seconds: number
  tenths: number
}

export interface Trainer {
  id: number
  firstName: string
  lastName: string
  shortName: string
  location: string
  birth: number
  homeTrack?: HomeTrack
  license: string
  statistics?: TrainerStatistics
  silks?: string
}

export interface TrainerStatistics {
  years: Record<string, YearlyDriverStats>
}

export interface HomeTrack {
  id: number
  name: string
}

export interface Owner {
  id: number
  name: string
  location?: string
}

export interface Breeder {
  id: number
  name: string
  location?: string
}

export interface Shoes {
  reported: boolean
  front: Front
  back: Back
}

export interface Front {
  hasShoe: boolean
  changed?: boolean
}

export interface Back {
  hasShoe: boolean
  changed?: boolean
}

export interface Sulky {
  reported: boolean
  type: SulkyType
  colour: SulkyColour
}

export interface SulkyType {
  code: string
  text: string
  engText: string
  changed: boolean
}

export interface SulkyColour {
  code: string
  text: string
  engText: string
  changed: boolean
}

export interface HorseStatistics {
  years: Record<string, YearlyHorseStats>
  life: LifeStats
  lastFiveStarts: LastFiveStarts
}

export interface YearlyHorseStats {
  starts: number
  earnings: number
  placement: Placement
  records: YearlyRaceRecord[]
}

export interface YearlyRaceRecord {
  code: string
  startMethod: string
  distance: string
  time: Time
  place: number
}

export interface LifeStats {
  starts: number
  earnings: number
  placement: Placement
  records: LifeRaceRecord[]
  winPercentage: number
  placePercentage: number
  earningsPerStart: number
  startPoints: number
}

export interface LifeRaceRecord {
  code: string
  startMethod: string
  distance: string
  time: Time
  place: number
  year: string
}

export interface Placement {
  '1': number
  '2': number
  '3': number
}

export interface LastFiveStarts {
  averageOdds: number
}

export interface Pedigree {
  father: Parent
  mother: Parent
  grandfather: Parent
}

export interface Parent {
  id: number
  name: string
  nationality?: string
}

export interface Driver {
  id: number
  firstName: string
  lastName: string
  shortName: string
  location: string
  birth: number
  homeTrack: HomeTrack
  license: string
  silks: string
  statistics: DriverStatistics
}

export interface DriverStatistics {
  years: Record<string, YearlyDriverStats>
}

export interface YearlyDriverStats {
  starts: number
  earnings: number
  placement: Placement
  winPercentage: number
}

export interface StartPools {
  vinnare: StartVinnare
  plats: StartPlats
  V64: StartV64
}

export interface StartVinnare {
  '@type': string
  odds: number
}

export interface StartPlats {
  '@type': string
  minOdds: number
  maxOdds: number
}

export interface StartV64 {
  '@type': string
  betDistribution: number
  trend: number
}
