export interface ATGGameRoot {
  type: string
  id: string
  status: string
  races: Race[]
  version: number
  newBettingSystem: boolean
  eventType: string
}

export interface Race {
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
  result: RaceResult
  status: string
  mediaId: string
  starts: Start[]
  mergedPools: MergedPool[]
}

export interface Track {
  id: number
  name: string
  condition: string
  countryCode: string
}

export interface RaceResult {
  victoryMargin: string
  scratchings?: number[]
}

export interface Start {
  id: string
  number: number
  postPosition: number
  distance: number
  horse: Horse
  driver: Driver
  result: StartResult
  videos?: Video[]
  out?: boolean
  scratched?: boolean
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
  time: RaceTime
}

export interface RaceTime {
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

export interface HomeTrack {
  id: number
  name: string
}

export interface TrainerStatistics {
  years: TrainerYearlyStats
}

export interface TrainerYearlyStats {
  year2024: TrainerYearStats
  year2025: TrainerYearStats
}

export interface TrainerYearStats {
  starts: number
  earnings: number
  placement: Placement
  winPercentage: number
}

export interface Placement {
  first: number
  second: number
  third: number
}

export interface Shoes {
  reported: boolean
  front?: ShoeInfo
  back?: ShoeInfo
}

export interface ShoeInfo {
  hasShoe: boolean
  changed?: boolean
}

export interface Sulky {
  reported: boolean
  type?: SulkyType
  stati: SulkyColor // Renamed 'colour' for consistency
}

export interface SulkyType {
  code: string
  text: string
  engText: string
  changed: boolean
}

export interface SulkyColor {
  code: string
  text: string
  engText: string
  changed: boolean
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

export interface HorseStatistics {
  years: HorseYearlyStats
  life: LifetimeStats
  lastFiveStarts: LastFiveStarts
}

export interface HorseYearlyStats {
  year2024: HorseYearStats // Renamed '2024'
  year2025: HorseYearStats // Renamed '2025'
}

export interface HorseYearStats {
  starts: number
  earnings: number
  placement: Placement
  records: RaceRecordEntry[]
}

export interface RaceRecordEntry {
  code: string
  startMethod: string
  distance: string
  time: RaceTime
  place: number
}

export interface LifetimeStats {
  starts: number
  earnings: number
  placement: Placement
  records: LifetimeRecord[]
  winPercentage: number
  placePercentage: number
  earningsPerStart: number
  startPoints: number
}

export interface LifetimeRecord {
  code: string
  startMethod: string
  distance: string
  time: RaceTime
  place: number
  year: string
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
  years: DriverYearlyStats
}

export interface DriverYearlyStats {
  year2024: DriverYearStats
  year2025: DriverYearStats
}

export interface DriverYearStats {
  starts: number
  earnings: number
  placement: Placement
  winPercentage: number
}

export interface StartResult {
  place?: number
  finishOrder: number
  kmTime?: KmTime
  prizeMoney?: number
  finalOdds: number
  startNumber: number
  galloped?: boolean
  disqualified?: boolean
}

export interface KmTime {
  minutes?: number
  seconds?: number
  tenths?: number
  code?: string
}

export interface Video {
  mediaId: string
  timestamp: string
}

export interface MergedPool {
  name: string
  betTypes: string[]
}
