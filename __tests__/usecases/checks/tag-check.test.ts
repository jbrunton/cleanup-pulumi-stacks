import {Stack} from '@entities/pulumi'
import {TagCheck} from '@usecases/check-legacy-stack/checks/tag-check'
import {TagPolicy} from '@entities/policies'

describe('TagCheck', () => {
  const policy: TagPolicy = {
    tag: 'environment',
    pattern: '(dev*|staging)'
  }

  const check = TagCheck(policy)

  const stack = (tagValue: string): Stack => ({
    name: 'stack',
    updateInProgress: false,
    getTag: async (tag: string) => (tag === 'environment' ? tagValue : null)
  })

  it('passes when the tag matches a literal', async () => {
    const result = await check(stack('staging'))
    expect(result).toEqual({
      isLegacy: true,
      description:
        'checked tag [environment=staging] against pattern [(dev*|staging)]'
    })
  })

  it('passes when the tag matches a glob pattern', async () => {
    const result = await check(stack('dev-1'))
    expect(result).toEqual({
      isLegacy: true,
      description:
        'checked tag [environment=dev-1] against pattern [(dev*|staging)]'
    })
  })

  it('fails when the tag does not match any patterns', async () => {
    const result = await check(stack('production'))
    expect(result).toEqual({
      isLegacy: false,
      description:
        'checked tag [environment=production] against pattern [(dev*|staging)]'
    })
  })

  it('fails when the tag is not present', async () => {
    const policy: TagPolicy = {
      tag: 'service',
      pattern: 'api'
    }
    const check = TagCheck(policy)

    const result = await check(stack('production'))

    expect(result).toEqual({
      isLegacy: false,
      description: 'checked tag [service=null] against pattern [api]'
    })
  })
})
