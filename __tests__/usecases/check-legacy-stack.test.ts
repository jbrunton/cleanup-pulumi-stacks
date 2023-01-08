import {StackSummary} from '@pulumi/pulumi/automation'
import {mock} from 'jest-mock-extended'
import {
  CheckLegacyStack,
  LegacyResult,
  Logger,
  TagSpec
} from '@usecases/check-legacy-stack'
import * as cmd from '@app/adapters/cmd'
import {subHours} from 'date-fns'
import {PulumiStack} from '@app/adapters/pulumi'

jest.mock('@app/adapters/cmd')

const exec = jest.mocked(cmd.exec)

describe('CheckLegacyStack', () => {
  const logger = mock<Logger>()
  const now = new Date('2021-01-01 12:00:00')
  const lastUpdate = subHours(now, 12).toISOString()

  beforeEach(() => {
    jest.useFakeTimers()
    jest.setSystemTime(now)
    exec.mockImplementation(async (cmd: string): Promise<string> => {
      const responses: Record<string, string> = {
        'pulumi stack tag get environment --stack production --cwd ./pulumi':
          'production',
        'pulumi stack tag get environment --stack staging --cwd ./pulumi':
          'staging',
        'pulumi stack tag get environment --stack development --cwd ./pulumi':
          'development'
      }
      return responses[cmd]
    })
  })

  const tags: TagSpec[] = [
    {
      tag: 'environment',
      patterns: ['staging', 'dev*']
    }
  ]

  const assertStack = async (summary: StackSummary, expected: LegacyResult) => {
    const stack = new PulumiStack(summary, './pulumi')
    const check = CheckLegacyStack({tags, timeoutHours: 6}, logger)
    const actual = await check(stack)
    expect(actual).toEqual(expected)
  }

  const assertLogs = (expected: string[]) => {
    expected.forEach((expectedMessage, index) => {
      expect(logger.log).toHaveBeenNthCalledWith(index + 1, expectedMessage)
    })
    expect(logger.log).toHaveBeenCalledTimes(expected.length)
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
    await assertStack(development, {
      name: 'development',
      isLegacy: true,
      requireDestroy: false
    })
    assertLogs([
      'checking stack development',
      '  [fail] checked [updateInProgress=false]',
      '  [fail] checked stack age [2021-01-01T00:00:00.000Z] against timeout [6 hours]',
      '  [fail] checked tag [environment=development] against patterns [staging,dev*]',
      '  [result] legacy stack - marking for cleanup'
    ])
  })

  it('returns false for non-legacy stacks', async () => {
    await assertStack(production, {
      name: 'production',
      isLegacy: false,
      requireDestroy: false
    })
    assertLogs([
      'checking stack production',
      '  [fail] checked [updateInProgress=false]',
      '  [fail] checked stack age [2021-01-01T00:00:00.000Z] against timeout [6 hours]',
      '  [pass] checked tag [environment=production] against patterns [staging,dev*]',
      '  [result] not a legacy stack - skipping'
    ])
  })
})
