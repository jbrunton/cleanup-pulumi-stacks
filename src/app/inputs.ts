import * as core from '@actions/core'
import {
  LegacyStackSpec,
  Options,
  TagSpec
} from '../domain/usecases/get-legacy-stacks'
import {createLogger} from './logger'

export type Inputs = {
  options: Options
  legacyStackSpec: LegacyStackSpec
}

export type ActionsCore = Pick<typeof core, 'getInput'>

export const getInputs = ({getInput}: ActionsCore): Inputs => {
  const workDir = getInput('working-directory')
  const tags = parseTags(getInput('legacy-tags'))
  const preview = getInput('preview') === 'true'
  const timeoutHours = parseInt(getInput('timeout-hours'), 10)
  const verbose = getInput('verbose') === 'true'

  return {
    options: {
      preview,
      workDir,
      logger: createLogger({preview, verbose})
    },
    legacyStackSpec: {
      tags,
      timeoutHours
    }
  }
}

const parseTags = (tagsInput: string): TagSpec[] => {
  const lines = split(tagsInput, '\n')
  return lines
    .filter(line => line.length)
    .map(line => {
      const [tag, rest] = split(line, ':')
      if (!rest) {
        throw new Error(`Error parsing tag spec: ${line}`)
      }
      const patterns = split(rest, ',')
      if (!patterns.length) {
        throw new Error(`Error parsing tag spec: ${line}`)
      }
      return {
        tag,
        patterns
      }
    })
}

const split = (string: string, separator: string): string[] =>
  string.split(separator).map(s => s.trim())
