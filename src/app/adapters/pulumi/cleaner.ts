import {LocalWorkspace} from '@pulumi/pulumi/automation'
import {StackCleaner} from '@usecases/cleanup-legacy-stacks'

export interface CreateCleanerParams {
  workspace: LocalWorkspace
  preview: boolean
  workDir: string
}

export const createCleaner = ({
  workspace,
  preview,
  workDir
}: CreateCleanerParams): StackCleaner => {
  return preview
    ? new PreviewStackCleaner()
    : new PulumiStackCleaner(workspace, workDir)
}

class PreviewStackCleaner implements StackCleaner {
  async destroyStack(): Promise<void> {
    return Promise.resolve()
  }
  async removeStack(): Promise<void> {
    return Promise.resolve()
  }
}

class PulumiStackCleaner implements StackCleaner {
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
