import {Inputs} from '@app/inputs'
import {cleanupLegacyStacks} from '@app/usecases/cleanup-legacy-stacks'
import {Logger} from '@entities/lib'
import {LocalWorkspace} from '@pulumi/pulumi/automation'
import {subHours} from 'date-fns'
import {mock} from 'jest-mock-extended'
import {assertInfos} from '../../fixtures/assertions'

const testWorkspace = mock<LocalWorkspace>()
const testLogger = mock<Logger>()

jest.mock('@pulumi/pulumi/automation', () => {
  return {
    LocalWorkspace: {
      async create() {
        return testWorkspace
      }
    }
  }
})

jest.mock('@actions/core', () => {
  return {
    info(message: string) {
      testLogger.info(message)
    }
  }
})

describe('cleanupLegacyStacks', () => {
  const now = new Date('2021-01-01 12:00:00')
  const lastUpdate = subHours(now, 3).toISOString()

  beforeEach(() => {
    jest.useFakeTimers()
    jest.setSystemTime(now)
    testWorkspace.listStacks.mockResolvedValue([
      {
        name: 'dev-1',
        current: false,
        updateInProgress: false,
        lastUpdate,
        resourceCount: 1
      }
    ])
  })

  it('cleans up legacy stacks defined by the inputs', async () => {
    const config = `
      policies:
        clean-dev:
          match:
            name: 'dev*'
          ttl:
            hours: 2
    `
    const inputs: Inputs = {
      preview: true,
      verbose: true,
      config,
      workDir: '.'
    }

    await cleanupLegacyStacks(inputs)

    assertInfos(testLogger, [
      'checking stack dev-1',
      '  checking policy clean-dev',
      '    [fail] checked [updateInProgress=false]',
      '    [fail] checked stack age [2021-01-01T09:00:00.000Z] against ttl [2 hours]',
      '    [fail] checked name [dev-1] against pattern [dev*]',
      '  [result] legacy stack - marking for cleanup',
      '[PREVIEW] Found 1 legacy dev stack(s) out of 1 total',
      '[PREVIEW] Destroyed legacy stack: dev-1',
      '[PREVIEW] Removed legacy stack: dev-1',
      '[PREVIEW] Removed 1 legacy stacks, 0 remaining'
    ])
  })
})
