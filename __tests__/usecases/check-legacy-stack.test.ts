import {StackSummary} from '@pulumi/pulumi/automation'
import {mock} from 'jest-mock-extended'
import {CheckLegacyStack} from '@usecases/check-legacy-stack'
import * as cmd from '@app/adapters/cmd'
import {subHours} from 'date-fns'
import {PulumiStack} from '@app/adapters/pulumi/stack'
import {StackPolicy} from '@entities/policies'
import {assertLogs} from '../fixtures/assertions'
import {Logger} from '@entities/lib'
import {LegacyResult} from '@entities/checks'

jest.mock('@app/adapters/cmd')

const exec = jest.mocked(cmd.exec)

describe('CheckLegacyStack', () => {
  const logger = mock<Logger>()
  const now = new Date('2021-01-01 12:00:00')
  const lastUpdate = subHours(now, 24).toISOString()

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

  const policies: StackPolicy[] = [
    {
      name: 'dev',
      ttl: {
        hours: 6
      },
      match: {
        tags: [
          {
            tag: 'environment',
            pattern: 'dev*'
          }
        ]
      }
    },
    {
      name: 'staging',
      ttl: {
        hours: 12
      },
      match: {
        name: {
          pattern: 'staging'
        }
      }
    }
  ]

  const assertStack = async (summary: StackSummary, expected: LegacyResult) => {
    const stack = new PulumiStack(summary, './pulumi')
    const check = CheckLegacyStack(policies, logger)
    const actual = await check(stack)
    expect(actual).toEqual(expected)
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

  const staging: StackSummary = {
    name: 'staging',
    updateInProgress: false,
    lastUpdate,
    current: false
  }

  it('returns true for legacy stacks', async () => {
    await assertStack(staging, {
      name: 'staging',
      isLegacy: true,
      requireDestroy: false
    })
    assertLogs(logger, [
      'checking stack staging',
      '  checking policy dev',
      '    [fail] checked [updateInProgress=false]',
      '    [fail] checked stack age [2020-12-31T12:00:00.000Z] against ttl [6 hours]',
      '    [pass] checked tag [environment=staging] against pattern [dev*]',
      '  checking policy staging',
      '    [fail] checked [updateInProgress=false]',
      '    [fail] checked stack age [2020-12-31T12:00:00.000Z] against ttl [12 hours]',
      '    [fail] checked name [staging] against pattern [staging]',
      '  [result] legacy stack - marking for cleanup'
    ])
  })

  it('short circuits policy checks', async () => {
    await assertStack(development, {
      name: 'development',
      isLegacy: true,
      requireDestroy: false
    })
    assertLogs(logger, [
      'checking stack development',
      '  checking policy dev',
      '    [fail] checked [updateInProgress=false]',
      '    [fail] checked stack age [2020-12-31T12:00:00.000Z] against ttl [6 hours]',
      '    [fail] checked tag [environment=development] against pattern [dev*]',
      '  [result] legacy stack - marking for cleanup'
    ])
  })

  it('returns false for non-legacy stacks', async () => {
    await assertStack(production, {
      name: 'production',
      isLegacy: false,
      requireDestroy: false
    })
    assertLogs(logger, [
      'checking stack production',
      '  checking policy dev',
      '    [fail] checked [updateInProgress=false]',
      '    [fail] checked stack age [2020-12-31T12:00:00.000Z] against ttl [6 hours]',
      '    [pass] checked tag [environment=production] against pattern [dev*]',
      '  checking policy staging',
      '    [fail] checked [updateInProgress=false]',
      '    [fail] checked stack age [2020-12-31T12:00:00.000Z] against ttl [12 hours]',
      '    [pass] checked name [production] against pattern [staging]',
      '  [result] not a legacy stack - skipping'
    ])
  })
})
