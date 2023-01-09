import * as usecases from '@usecases/cleanup-legacy-stacks'
import {CheckLegacyStack} from '@usecases/check-legacy-stack'
import {Inputs} from '@app/inputs'
import {LocalWorkspace} from '@pulumi/pulumi/automation'
import {PulumiStack} from '@app/adapters/pulumi/stack'
import {createCleaner} from '@app/adapters/pulumi/cleaner'
import {createLogger} from '@app/adapters/logger'
import {parsePolicies} from '@usecases/parse-policies'

export const cleanupLegacyStacks = async (inputs: Inputs): Promise<void> => {
  const {workDir, preview} = inputs
  const logger = createLogger(inputs)
  const policies = parsePolicies(inputs.config)

  const workspace = await LocalWorkspace.create({workDir})
  const cleaner = createCleaner({workspace, preview, workDir})

  const stacks = await workspace.listStacks()
  await usecases.cleanupLegacyStacks(
    stacks.map(summary => new PulumiStack(summary, workDir)),
    cleaner,
    CheckLegacyStack(policies, logger),
    logger
  )
}
