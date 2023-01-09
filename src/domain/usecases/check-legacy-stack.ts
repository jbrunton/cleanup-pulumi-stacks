import {isNil, reject} from 'rambda'
import {Check} from './checks/check'
import {Stack} from '@entities/pulumi'
import {StackAgeCheck} from './checks/stack-age-check'
import {StackNameCheck} from './checks/stack-name-check'
import {StackPolicy} from '@entities/policies'
import {TagCheck} from './checks/tag-check'
import {UpdateCheck} from './checks/update-check'

export type LegacyResult = {
  name: string
  isLegacy: boolean
  requireDestroy: boolean
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

const checksForPolicy = (policy: StackPolicy): Check[] =>
  reject(isNil)([
    UpdateCheck,
    StackAgeCheck(policy.ttl),
    policy.match.name ? StackNameCheck(policy.match.name) : undefined,
    ...(policy.match.tags ? policy.match.tags.map(tag => TagCheck(tag)) : [])
  ])

const checkPolicy = async (
  policy: StackPolicy,
  stack: Stack,
  logger: Logger
): Promise<{isLegacy: boolean}> => {
  const checks = checksForPolicy(policy)

  for (const check of checks) {
    const {isLegacy, description} = await check(stack)
    logger.log(`    ${isLegacy ? '[fail]' : '[pass]'} ${description}`)
    if (!isLegacy) {
      return {isLegacy: false}
    }
  }

  return {
    isLegacy: true
  }
}

export const CheckLegacyStack = (
  policies: StackPolicy[],
  logger: Logger
): ((stack: Stack) => Promise<LegacyResult>) => {
  return async stack => {
    logger.log(`checking stack ${stack.name}`)
    for (const policy of policies) {
      logger.log(`  checking policy ${policy.name}`)
      const {isLegacy} = await checkPolicy(policy, stack, logger)

      if (isLegacy) {
        logger.log('  [result] legacy stack - marking for cleanup')
        return {
          name: stack.name,
          isLegacy,
          requireDestroy: !!stack.resourceCount
        }
      }
    }
    logger.log('  [result] not a legacy stack - skipping')
    return {name: stack.name, isLegacy: false, requireDestroy: false}
  }
}
