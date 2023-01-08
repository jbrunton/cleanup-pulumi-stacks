import {StackAgeCheck} from './checks/stack-age-check'
import {StackSummary} from '@pulumi/pulumi/automation'
import {TagCheck} from './checks/tag-check'
import {getTagValue} from '@app/adapters/pulumi'

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
  log: (message: string) => void
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

export const isLegacyStack = async (
  stack: StackSummary,
  {tags, timeoutHours}: LegacyStackSpec,
  {workDir, logger}: Options
): Promise<boolean> => {
  logger.log(`checking stack ${stack.name}`)

  const tagValues = await getTagValues(stack.name, workDir, tags)

  const checks = [
    ...tags.map(tag => TagCheck(tag, tagValues)),
    StackAgeCheck(stack, timeoutHours)
  ]

  for (const check of checks) {
    const {isLegacy, description} = check()
    logger.log(`  ${isLegacy ? '[fail]' : '[pass]'} ${description}`)
    if (!isLegacy) {
      logger.log('  [result] not a legacy stack - skipping')
      return false
    }
  }

  logger.log('  [result] legacy stack - marking for cleanup')
  return true
}
