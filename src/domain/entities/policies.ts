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

export type MatchPolicy = {
  name?: StackNamePolicy
  tags?: TagPolicy[]
}

export type StackPolicy = {
  name: string
  match: MatchPolicy
  ttl: TTLPolicy
}

export const isValidMatchPolicy = ({name, tags}: MatchPolicy): boolean =>
  !(name === undefined && tags === undefined)

export type PolicyParser = (input: string) => StackPolicy[]
