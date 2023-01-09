import {Stack} from '@entities/pulumi'
import {StackAgeCheck} from '@usecases/check-legacy-stack/checks/stack-age-check'
import {TTLPolicy} from '@entities/policies'
import {sub} from 'date-fns'

describe('StackAgeCheck', () => {
  const policy: TTLPolicy = {
    hours: 3,
    minutes: 30
  }

  const check = StackAgeCheck(policy)

  const stack = (lastUpdate?: Date): Stack => ({
    name: 'test',
    lastUpdate,
    updateInProgress: false,
    getTag: async () => null
  })

  const now = new Date('2021-01-01 12:00:00')

  beforeEach(() => {
    jest.useFakeTimers()
    jest.setSystemTime(now)
  })

  it('passes when the stack younger than the ttl policy', async () => {
    const oneHourAgo = sub(now, {hours: 1})
    const result = await check(stack(oneHourAgo))
    expect(result).toEqual({
      isLegacy: false,
      description:
        'checked stack age [2021-01-01T11:00:00.000Z] against ttl [3 hours 30 minutes]'
    })
  })

  it('fails when the stack is older than the ttl policy', async () => {
    const fourHoursAgo = sub(now, {hours: 4})
    const result = await check(stack(fourHoursAgo))
    expect(result).toEqual({
      isLegacy: true,
      description:
        'checked stack age [2021-01-01T08:00:00.000Z] against ttl [3 hours 30 minutes]'
    })
  })

  it('passes when the stack has never been updated', async () => {
    const result = await check(stack(undefined))
    expect(result).toEqual({
      isLegacy: false,
      description:
        'checked stack age [undefined] against ttl [3 hours 30 minutes]'
    })
  })

  it('requires a valid policy', () => {
    expect(() => StackAgeCheck({})).toThrow('Invalid TTL policy')
    expect(() => StackAgeCheck({days: 0})).not.toThrow()
    expect(() => StackAgeCheck({hours: 1})).not.toThrow()
  })
})
