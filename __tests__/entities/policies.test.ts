import {
  isValidMatchPolicy,
  isValidTTL,
  StackNamePolicy,
  TagPolicy
} from '@entities/policies'

describe('isValidTTL', () => {
  it('returns true for valid TTL policies', () => {
    expect(isValidTTL({days: 1})).toEqual(true)
    expect(isValidTTL({hours: 1})).toEqual(true)
    expect(isValidTTL({minutes: 1})).toEqual(true)
  })

  it('treats 0 time units as valid', () => {
    expect(isValidTTL({days: 0})).toEqual(true)
    expect(isValidTTL({hours: 0})).toEqual(true)
    expect(isValidTTL({minutes: 0})).toEqual(true)
  })

  it('returns false for invalid TTL policies', () => {
    expect(isValidTTL({})).toEqual(false)
  })
})

describe('isValidMatchPolicy', () => {
  const namePolicy: StackNamePolicy = {pattern: 'dev'}
  const tagPolicy: TagPolicy = {tag: 'env', pattern: 'dev'}

  it('returns true for valid match policies', () => {
    expect(isValidMatchPolicy({name: namePolicy})).toEqual(true)
    expect(isValidMatchPolicy({tags: [tagPolicy]})).toEqual(true)
  })

  it('returns false for invalid match policies', () => {
    expect(isValidMatchPolicy({})).toEqual(false)
    expect(isValidMatchPolicy({tags: []})).toEqual(false)
  })
})
