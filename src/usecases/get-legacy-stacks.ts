import {StackSummary} from '@pulumi/pulumi/automation'
import {getTagValue} from '../cmd'
import micromatch from 'micromatch'
import {subHours} from 'date-fns'

export type LegacyStack = {
  name: string
  requireDestroy: boolean
}

export type TagSpec = {
  tag: string
  patterns: string[]
}

export type LegacyStackSpec = {
  tags: TagSpec[]
  timeoutHours: number
}

export type Logger = {
  info: (message: string) => void
  preview: (message: string) => void
}

export type Options = {
  workDir: string
  preview: boolean
  logger: Logger
}

export const getLegacyStacks = async (
  stacks: StackSummary[],
  legacySpec: LegacyStackSpec,
  options: Options
): Promise<LegacyStack[]> => {
  const legacyStacks: StackSummary[] = []
  for (const stack of stacks) {
    if (await isLegacyStack(stack, legacySpec, options)) {
      legacyStacks.push(stack)
    }
  }
  return legacyStacks.map(({name, resourceCount}) => ({
    name,
    requireDestroy: !!resourceCount
  }))
}

const getTagValues = async (
  stackName: string,
  workDir: string,
  tags: TagSpec[]
): Promise<Record<string, string>> => {
  const tagValues = await Promise.all(
    tags.map(async tagSpec => {
      const value = await getTagValue(stackName, tagSpec.tag, workDir)
      return [tagSpec.tag, value]
    })
  )
  return Object.fromEntries(tagValues)
}

const checkResultString = (isLegacy: boolean): string =>
  isLegacy ? '[fail]' : '[pass]'

const hasLegacyTags = (
  tagValues: Record<string, string>,
  tags: TagSpec[],
  logger: Logger
): boolean => {
  return tags.some(tagSpec => {
    const value = tagValues[tagSpec.tag]
    const isLegacy = value ? micromatch.isMatch(value, tagSpec.patterns) : false
    logger.preview(
      `  ${checkResultString(isLegacy)} checked tag [${
        tagSpec.tag
      }=${value}] against patterns [${tagSpec.patterns}]`
    )
    return isLegacy
  })
}

export const isLegacyStack = async (
  stack: StackSummary,
  {tags, timeoutHours}: LegacyStackSpec,
  {workDir, logger}: Options
): Promise<boolean> => {
  logger.preview(`checking stack ${stack.name}`)

  const tagValues = await getTagValues(stack.name, workDir, tags)
  const legacyTags = hasLegacyTags(tagValues, tags, logger)
  if (!legacyTags) {
    logger.preview('  [result] not a legacy stack - skipping')
    return false
  }

  const stackAge = stack.lastUpdate ? new Date(stack.lastUpdate) : null
  const timeoutAge = subHours(new Date(), timeoutHours)
  const reachedTimeout = stackAge ? stackAge < timeoutAge : false
  logger.preview(
    `  ${checkResultString(
      reachedTimeout
    )} checked stack age [${stackAge?.toISOString()}] against timeout [${timeoutHours} hours]`
  )
  if (!reachedTimeout) {
    logger.preview('  [result] not a legacy stack - skipping')
    return false
  }

  logger.preview('  [result] legacy stack - marking for cleanup')
  return true
}
