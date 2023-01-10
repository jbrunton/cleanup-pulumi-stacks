import {isNil, reject} from 'rambda'
import {Check} from './checks/check'
import {LegacyResult} from '@entities/checks'
import {Logger} from '@entities/lib'
import {Stack} from '@entities/pulumi'
import {StackAgeCheck} from './checks/stack-age-check'
import {StackNameCheck} from './checks/stack-name-check'
import {StackPolicy} from '@entities/policies'
import {TagCheck} from './checks/tag-check'
import {UpdateCheck} from './checks/update-check'

const checksForPolicy = ({match, ttl}: StackPolicy): Check[] => {
  const matchChecks = match
    ? [
        match.name ? StackNameCheck(match.name) : undefined,
        ...(match.tags ? match.tags.map(tag => TagCheck(tag)) : [])
      ]
    : []
  return reject(isNil)([UpdateCheck, StackAgeCheck(ttl), ...matchChecks])
}

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
