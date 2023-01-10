import {cleanupLegacyStacks} from '@app/usecases/cleanup-legacy-stacks'
import {Inputs} from '@app/inputs'
import * as fs from 'fs'

async function run(): Promise<void> {
  const config = fs.readFileSync('./pulumi/cleanup-config.yml', {
    encoding: 'utf-8'
  })
  try {
    const inputs: Inputs = {
      workDir: './pulumi',
      preview: process.env.PREVIEW !== 'false',
      verbose: true,
      config
    }
    await cleanupLegacyStacks(inputs)
  } catch (error) {
    if (error instanceof Error) {
      console.error(error)
      process.exit(1)
    }
  }
}

run()
