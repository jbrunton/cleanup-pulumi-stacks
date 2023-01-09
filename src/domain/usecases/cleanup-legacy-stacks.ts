import {LegacyResult} from '@entities/checks'
import {Logger} from '@entities/lib'
import {Stack} from '@entities/pulumi'

export interface StackCleaner {
  destroyStack(stackName: string): Promise<void>
  removeStack(stackName: string): Promise<void>
}

export type StackCheck = (stack: Stack) => Promise<LegacyResult>

export const cleanupLegacyStacks = async (
  stacks: Stack[],
  cleaner: StackCleaner,
  check: StackCheck,
  logger: Logger
): Promise<void> => {
  const legacyStacks: LegacyResult[] = []

  for (const stack of stacks) {
    const result = await check(stack)
    if (result.isLegacy) {
      legacyStacks.push(result)
    }
  }

  logger.info(
    `Found ${legacyStacks.length} legacy dev stack(s) out of ${stacks.length} total`
  )

  const cleanupStack = async ({
    name,
    requireDestroy
  }: LegacyResult): Promise<void> => {
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
