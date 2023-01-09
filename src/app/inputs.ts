import * as actionsCore from '@actions/core'
import * as fs from 'fs'
import * as path from 'path'

export type Inputs = {
  workDir: string
  preview: boolean
  verbose: boolean
  config: string
}

export type ActionsCore = Pick<
  typeof actionsCore,
  'getInput' | 'getBooleanInput' | 'info'
>

export const getInputs = (core: ActionsCore): Inputs => {
  const workDir = core.getInput('working-directory')
  const preview = core.getBooleanInput('preview')
  const verbose = core.getBooleanInput('verbose')
  const config = getConfig(workDir, core)

  return {
    workDir,
    preview,
    verbose,
    config
  }
}

const getConfig = (workDir: string, core: ActionsCore): string => {
  const configYaml = core.getInput('config')
  if (configYaml) {
    return configYaml
  }

  const configFile = path.join(
    process.cwd(),
    workDir,
    core.getInput('config_file')
  )
  const exists = fs.existsSync(configFile)
  if (!exists) {
    throw new Error(`File ${configFile} does not exist`)
  }

  core.info(`reading config from ${configFile}`)
  return fs.readFileSync(configFile, {encoding: 'utf8'})
}
