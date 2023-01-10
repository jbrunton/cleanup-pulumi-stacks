import {Stack} from '@entities/pulumi'
import {StackNameCheck} from '@usecases/check-legacy-stack/checks/stack-name-check'

describe('StackNameCheck', () => {
  const stack = (name: string): Stack => ({
    name,
    updateInProgress: false,
    getTag: async () => null
  })

  it('matches literal patterns', async () => {
    const check = StackNameCheck({pattern: 'staging'})

    const stagingResult = await check(stack('staging'))
    expect(stagingResult).toEqual({
      isLegacy: true,
      description: 'checked name [staging] against pattern [staging]'
    })

    const staging1Result = await check(stack('staging-1'))
    expect(staging1Result).toEqual({
      isLegacy: false,
      description: 'checked name [staging-1] against pattern [staging]'
    })
  })

  it('matches glob patterns', async () => {
    const check = StackNameCheck({pattern: 'dev*'})

    const dev1Result = await check(stack('dev-1'))
    expect(dev1Result).toEqual({
      isLegacy: true,
      description: 'checked name [dev-1] against pattern [dev*]'
    })

    const stagingResult = await check(stack('staging'))
    expect(stagingResult).toEqual({
      isLegacy: false,
      description: 'checked name [staging] against pattern [dev*]'
    })
  })

  it('matches logical or expressions', async () => {
    const check = StackNameCheck({pattern: '(dev|staging)'})

    const devResult = await check(stack('dev'))
    expect(devResult).toEqual({
      isLegacy: true,
      description: 'checked name [dev] against pattern [(dev|staging)]'
    })

    const stagingResult = await check(stack('staging'))
    expect(stagingResult).toEqual({
      isLegacy: true,
      description: 'checked name [staging] against pattern [(dev|staging)]'
    })

    const prodResult = await check(stack('prod'))
    expect(prodResult).toEqual({
      isLegacy: false,
      description: 'checked name [prod] against pattern [(dev|staging)]'
    })
  })

  it('matches negations', async () => {
    const check = StackNameCheck({pattern: '!prod'})

    const devResult = await check(stack('dev'))
    expect(devResult).toEqual({
      isLegacy: true,
      description: 'checked name [dev] against pattern [!prod]'
    })

    const prodResult = await check(stack('prod'))
    expect(prodResult).toEqual({
      isLegacy: false,
      description: 'checked name [prod] against pattern [!prod]'
    })
  })
})
