import {Stack} from '@entities/pulumi'
import {StackNameCheck} from '@usecases/check-legacy-stack/checks/stack-name-check'
import {StackNamePolicy} from '@entities/policies'

describe('StackNameCheck', () => {
  const policy: StackNamePolicy = {
    patterns: ['dev*', 'staging']
  }

  const check = StackNameCheck(policy)

  const stack = (name: string): Stack => ({
    name,
    updateInProgress: false,
    getTag: async () => null
  })

  it('passes when the stack name matches a literal', async () => {
    const result = await check(stack('staging'))
    expect(result).toEqual({
      isLegacy: true,
      description: 'checked name [staging] against patterns [dev*,staging]'
    })
  })

  it('passes when the stack name matches a glob pattern', async () => {
    const result = await check(stack('dev-1'))
    expect(result).toEqual({
      isLegacy: true,
      description: 'checked name [dev-1] against patterns [dev*,staging]'
    })
  })

  it('fails when the stack does not match any patterns', async () => {
    const result = await check(stack('production'))
    expect(result).toEqual({
      isLegacy: false,
      description: 'checked name [production] against patterns [dev*,staging]'
    })
  })
})
