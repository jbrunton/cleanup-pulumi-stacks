import * as core from '@actions/core'
import {cleanupLegacyStacks} from './app/usecases/cleanup-legacy-stacks'
import {getInputs} from '@app/inputs'

async function run(): Promise<void> {
  try {
    const inputs = getInputs(core)
    await cleanupLegacyStacks(inputs)
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
