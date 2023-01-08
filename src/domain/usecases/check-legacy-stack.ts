import {Stack} from '@entities/pulumi'
import {StackAgeCheck} from './checks/stack-age-check'
import {TagCheck} from './checks/tag-check'
import {UpdateCheck} from './checks/update-check'

export type LegacyResult = {
  name: string
  isLegacy: boolean
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

export const CheckLegacyStack = (
  {tags, timeoutHours}: LegacyStackSpec,
  logger: Logger
): ((stack: Stack) => Promise<LegacyResult>) => {
  const checks = [
    UpdateCheck,
    StackAgeCheck(timeoutHours),
    ...tags.map(tag => TagCheck(tag))
  ]

  return async stack => {
    logger.log(`checking stack ${stack.name}`)

    for (const check of checks) {
      const {isLegacy, description} = await check(stack)
      logger.log(`  ${isLegacy ? '[fail]' : '[pass]'} ${description}`)
      if (!isLegacy) {
        logger.log('  [result] not a legacy stack - skipping')
        return {name: stack.name, isLegacy: false, requireDestroy: false}
      }
    }

    logger.log('  [result] legacy stack - marking for cleanup')
    return {
      name: stack.name,
      isLegacy: true,
      requireDestroy: !!stack.resourceCount
    }
  }
}
