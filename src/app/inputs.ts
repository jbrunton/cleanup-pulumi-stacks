import * as actionsCore from '@actions/core'
import * as fs from 'fs'
import * as path from 'path'
import {Options} from '@usecases/check-legacy-stack'
import {StackPolicy} from '@entities/policies'
import {createLogger} from './logger'
import {parsePolicies} from '@usecases/parse-policies'

export type Inputs = {
  options: Options
  policies: StackPolicy[]
}

export type ActionsCore = Pick<
  typeof actionsCore,
  'getInput' | 'getBooleanInput' | 'info'
>

export const getInputs = (core: ActionsCore): Inputs => {
  const workDir = core.getInput('working-directory')
  const preview = core.getBooleanInput('preview')
  const verbose = core.getBooleanInput('verbose')
  const configYaml = getConfigYaml(workDir, core)
  const policies = parsePolicies(configYaml)

  return {
    options: {
      preview,
      workDir,
      logger: createLogger({preview, verbose})
    },
    policies
  }
}

const getConfigYaml = (workDir: string, core: ActionsCore): string => {
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
