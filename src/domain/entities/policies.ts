export type TTLPolicy = {
  days?: number
  hours?: number
  minutes?: number
}

export const isValidTTL = ({days, hours, minutes}: TTLPolicy): boolean =>
  !(days === undefined && hours === undefined && minutes === undefined)

export type TagPolicy = {
  tag: string
  pattern: string
}

export type StackNamePolicy = {
  pattern: string
}

export type StackPolicy = {
  name: string
  match?: {
    name?: StackNamePolicy
    tags?: TagPolicy[]
  }
  ttl: TTLPolicy
}

export type PolicyParser = (input: string) => StackPolicy[]
