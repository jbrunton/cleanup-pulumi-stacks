import * as usecases from '@usecases/cleanup-legacy-stacks'
import {LegacyStackSpec, Options} from '@usecases/get-legacy-stacks'
import {LocalWorkspace} from '@pulumi/pulumi/automation'

export const cleanupLegacyStacks = async (
  options: Options,
  legacySpec: LegacyStackSpec
): Promise<void> => {
  const {workDir} = options
  const workspace = await LocalWorkspace.create({workDir})
  const stacks = await workspace.listStacks()
  const cleaner = options.preview
    ? new PreviewStackCleaner()
    : new StackCleaner(workspace, workDir)
  await usecases.cleanupLegacyStacks(stacks, cleaner, legacySpec, options)
}

class PreviewStackCleaner implements usecases.StackCleaner {
  async destroyStack(): Promise<void> {
    return Promise.resolve()
  }
  async removeStack(): Promise<void> {
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
