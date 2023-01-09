export type TTLPolicy = {
  hours?: number
  minutes?: number
}

export type TagPolicy = {
  tag: string
  patterns: string[]
}

export type StackPolicy = {
  name: string
  match: {
    // name: z.string(),
    tags: TagPolicy[]
  }
  ttl: TTLPolicy
}

export type PolicyParser = (input: string) => StackPolicy[]
