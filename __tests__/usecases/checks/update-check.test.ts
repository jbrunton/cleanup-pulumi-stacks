import {Stack} from '@entities/pulumi'
import {UpdateCheck} from '@usecases/check-legacy-stack/checks/update-check'

describe('UpdateCheck', () => {
  const check = UpdateCheck

  const stack = (updateInProgress: boolean): Stack => ({
    name: 'test',
    updateInProgress,
    getTag: async () => null
  })

  it('passes if an update is in progress', async () => {
    const result = await check(stack(true))
    expect(result).toEqual({
      isLegacy: false,
      description: 'checked [updateInProgress=true]'
    })
  })

  it('fails if no update is in progress', async () => {
    const result = await check(stack(false))
    expect(result).toEqual({
      isLegacy: true,
      description: 'checked [updateInProgress=false]'
    })
  })
})
