import { RecordResult } from './Record'

export interface ATGStartRoot {
  raceId: string
  startNumber: number
  sport: string
  horse: Horse
  driver: Driver
}

interface Horse {
  id: number
  name: string
  nationality: string
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
  location: string
  birth: number
  homeTrack: HomeTrack
  license: string
}

interface HomeTrack {
  id: number
  name: string
}

interface Record {
  code: string
  startMethod: string
  distance: string
  time: Time
  place: number
}

interface Time {
  minutes: number
  seconds: number
  tenths: number
}

interface Results {
  records: RecordResult[]
  hasMoreRecords: boolean
}

interface KmTime {
  minutes?: number
  seconds?: number
  tenths?: number
  code?: string
}

interface Race {
  id?: string
  sport: string
  type: string
  number: number
  startMethod: string
  firstPrize: number
}

interface Track {
  id?: number
  name: string
  condition: string
  countryCode: string
}

interface Start {
  distance: number
  postPosition?: number
  driver: Driver
  horse: Horse
}

interface Driver {
  id: number
  firstName: string
  lastName: string
  shortName: string
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
