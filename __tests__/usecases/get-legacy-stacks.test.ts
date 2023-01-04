import {StackSummary} from '@pulumi/pulumi/automation'
import {mock} from 'jest-mock-extended'
import {
  isLegacyStack,
  Logger,
  TagSpec
} from '../../src/usecases/get-legacy-stacks'
import * as cmd from '../../src/cmd'
import {subHours} from 'date-fns'

jest.mock('../../src/cmd')

const getTagValue = jest.mocked(cmd.getTagValue)

describe('getLegacyStacks', () => {
  const logger = mock<Logger>()

  const options = {
    workDir: '.',
    logger,
    preview: true
  }

  const now = new Date('2021-01-01 12:00:00')
  const lastUpdate = subHours(now, 12).toISOString()

  beforeEach(() => {
    jest.useFakeTimers()
    jest.setSystemTime(now)
    getTagValue.mockImplementation(
      async (stackName, tag, _workDir): Promise<string> => {
        const stacks: Record<string, Record<string, string>> = {
          production: {
            environment: 'production'
          },
          staging: {
            environment: 'staging'
          },
          development: {
            environment: 'development'
          }
        }
        return stacks[stackName][tag]
      }
    )
  })

  const tags: TagSpec[] = [
    {
      tag: 'environment',
      patterns: ['staging', 'dev*']
    }
  ]

  const assertStack = async (
    stack: StackSummary,
    {isLegacy}: {isLegacy: boolean}
  ) => {
    const actual = await isLegacyStack(stack, {tags, timeoutHours: 6}, options)
    expect(actual).toEqual(isLegacy)
  }

  const production: StackSummary = {
    name: 'production',
    updateInProgress: false,
    lastUpdate,
    current: false
  }

  const development: StackSummary = {
    name: 'development',
    updateInProgress: false,
    lastUpdate,
    current: false
  }

  it('returns true for legacy stacks', async () => {
    await assertStack(development, {isLegacy: true})
    expect(logger.log).toHaveBeenNthCalledWith(1, 'checking stack development')
    expect(logger.log).toHaveBeenNthCalledWith(
      2,
      '  [fail] checked tag [environment=development] against patterns [staging,dev*]'
    )
    expect(logger.log).toHaveBeenNthCalledWith(
      3,
      '  [fail] checked stack age [2021-01-01T00:00:00.000Z] against timeout [6 hours]'
    )
    expect(logger.log).toHaveBeenNthCalledWith(
      4,
      '  [result] legacy stack - marking for cleanup'
    )
  })

  it('returns false for non-legacy stacks', async () => {
    await assertStack(production, {isLegacy: false})
    expect(logger.log).toHaveBeenNthCalledWith(1, 'checking stack production')
    expect(logger.log).toHaveBeenNthCalledWith(
      2,
      '  [pass] checked tag [environment=production] against patterns [staging,dev*]'
    )
    expect(logger.log).toHaveBeenNthCalledWith(
      3,
      '  [result] not a legacy stack - skipping'
    )
  })
})
