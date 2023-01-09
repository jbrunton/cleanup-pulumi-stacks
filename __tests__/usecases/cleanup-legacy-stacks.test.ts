import {LegacyResult} from '@entities/checks'
import {Logger} from '@entities/lib'
import {Stack} from '@entities/pulumi'
import {
  cleanupLegacyStacks,
  StackCleaner
} from '@usecases/cleanup-legacy-stacks'
import {mock} from 'jest-mock-extended'
import {assertInfos} from '../fixtures/assertions'

describe('cleanupLegacyStacks', () => {
  const cleaner = mock<StackCleaner>()
  const logger = mock<Logger>()
  const check = jest.fn()

  const dev: Stack = {
    name: 'dev',
    updateInProgress: false,
    getTag: async () => null
  }

  const staging: Stack = {
    name: 'staging',
    updateInProgress: false,
    getTag: async () => null
  }

  const production: Stack = {
    name: 'prod',
    updateInProgress: false,
    getTag: async () => null
  }

  beforeEach(() => {
    check.mockImplementation((stack): LegacyResult => {
      return {
        [dev.name]: {
          name: dev.name,
          isLegacy: true,
          requireDestroy: false
        },
        [staging.name]: {
          name: staging.name,
          isLegacy: true,
          requireDestroy: true
        },
        [production.name]: {
          name: production.name,
          isLegacy: false,
          requireDestroy: false
        }
      }[stack.name]
    })
  })

  it('destroys and removes legacy stacks', async () => {
    const stacks: Stack[] = [dev, staging, production]

    await cleanupLegacyStacks(stacks, cleaner, check, logger)

    expect(cleaner.destroyStack).not.toHaveBeenCalledWith(dev.name)
    expect(cleaner.removeStack).toHaveBeenCalledWith(dev.name)

    expect(cleaner.destroyStack).toHaveBeenCalledWith(staging.name)
    expect(cleaner.removeStack).toHaveBeenCalledWith(staging.name)

    assertInfos(logger, [
      'Found 2 legacy dev stack(s) out of 3 total',
      'Removed legacy stack: dev',
      'Destroyed legacy stack: staging',
      'Removed legacy stack: staging',
      'Removed 2 legacy stacks, 1 remaining'
    ])
  })
})
