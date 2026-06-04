export interface ATGRecordRoot {
  raceId: string
  startNumber: number
  sport: string
  horse: Horse
  driver: Driver
}

interface Horse {
  id: number
  name: string
  age: number
  sex: string
  trainer: Trainer
  money: number
  homeTrack: HomeTrack
  results: Results
}

interface Trainer {
  id: number
  firstName: string
  lastName: string
  shortName: string
  homeTrack: HomeTrack
}

interface HomeTrack {
  id: number
  name: string
}

interface Results {
  records: RecordResult[]
  hasMoreRecords: boolean
}

export interface RecordResult {
  date: string
  link: boolean
  kmTime: KmTime
  odds: number
  place: string
  mediaId: string
  race: Race
  track: Track
  start: Start
  scratched: boolean
  oddsCode: string
  disqualified: boolean
  galloped: boolean
}

interface KmTime {
  minutes: number
  seconds: number
  tenths: number
  code: string
}

interface Race {
  id: string
  sport: string
  type: string
  number: number
  startMethod: string
  firstPrize: number
}

interface Track {
  id: number
  name: string
  condition: string
  countryCode: string
}

interface Start {
  distance: number
  postPosition: number
  driver: Driver
  horse: HorseRecord
}

interface HorseRecord {
  shoes: Shoes
  sulky: Sulky
}

interface Shoes {
  front: boolean
  back: boolean
}

interface Sulky {
  type: Type
}

interface Type {
  code: string
  text: string
}

interface Driver {
  id: number
  firstName: string
  lastName: string
  shortName: string
  location: string
  birth: number
  homeTrack: HomeTrack
}
