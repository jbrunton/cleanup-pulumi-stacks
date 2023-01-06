import {
  LegacyStack,
  LegacyStackSpec,
  Options,
  getLegacyStacks
} from './get-legacy-stacks'
import {StackSummary} from '@pulumi/pulumi/automation'

export interface StackCleaner {
  destroyStack(stackName: string): Promise<void>
  removeStack(stackName: string): Promise<void>
}

export const cleanupLegacyStacks = async (
  stacks: StackSummary[],
  cleaner: StackCleaner,
  legacySpec: LegacyStackSpec,
  options: Options
): Promise<void> => {
  const {logger} = options

  const legacyStacks = await getLegacyStacks(stacks, legacySpec, options)
  logger.info(
    `Found ${legacyStacks.length} legacy dev stack(s) out of ${stacks.length} total`
  )

  const cleanupStack = async ({
    name,
    requireDestroy
  }: LegacyStack): Promise<void> => {
    if (requireDestroy) {
      await cleaner.destroyStack(name)
      logger.info(`Destroyed legacy stack: ${name}`)
    }

    await cleaner.removeStack(name)
    logger.info(`Removed legacy stack: ${name}`)
  }

  await Promise.all(legacyStacks.map(cleanupStack))
  logger.info(
    `Removed ${legacyStacks.length} legacy stacks, ${
      stacks.length - legacyStacks.length
    } remaining`
  )
}
