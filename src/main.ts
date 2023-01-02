import * as core from '@actions/core'
import {cleanupLegacyStacks} from './cleaner'
import {getInputs} from './app/inputs'

async function run(): Promise<void> {
  try {
    const {options, legacyStackSpec} = getInputs(core)
    await cleanupLegacyStacks(options, legacyStackSpec)
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
