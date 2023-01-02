import {LocalWorkspace} from '@pulumi/pulumi/automation'
import {LegacyStackSpec, Logger, Options} from './usecases/get-legacy-stacks'
import * as usecases from './usecases/cleanup-legacy-stacks'

export const cleanupLegacyStacks = async (
  options: Options,
  legacySpec: LegacyStackSpec
) => {
  const {workDir} = options
  const workspace = await LocalWorkspace.create({workDir})
  const stacks = await workspace.listStacks()
  const cleaner = options.preview
    ? new NullStackCleaner()
    : new StackCleaner(workspace, workDir)
  await usecases.cleanupLegacyStacks(stacks, cleaner, legacySpec, options)
}

class NullStackCleaner implements usecases.StackCleaner {
  destroyStack(): Promise<void> {
    return Promise.resolve()
  }
  removeStack(): Promise<void> {
    return Promise.resolve()
  }
}

class StackCleaner implements usecases.StackCleaner {
  private readonly workspace: LocalWorkspace
  private readonly workDir: string

  constructor(workspace: LocalWorkspace, workDir: string) {
    this.workspace = workspace
    this.workDir = workDir
  }

  async destroyStack(stackName: string): Promise<void> {
    const stack = await LocalWorkspace.selectStack({
      stackName,
      workDir: this.workDir
    })
    await stack.destroy()
  }

  async removeStack(stackName: string): Promise<void> {
    await this.workspace.removeStack(stackName)
  }
}
