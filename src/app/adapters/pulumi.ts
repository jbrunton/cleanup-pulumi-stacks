import * as cmd from './cmd'
import {Stack} from '@entities/pulumi'
import {StackSummary} from '@pulumi/pulumi/automation'

export class PulumiStack implements Stack {
  readonly name: string
  readonly lastUpdate: Date | undefined
  readonly updateInProgress: boolean
  readonly resourceCount: number | undefined

  private readonly workDir: string

  constructor(summary: StackSummary, workDir: string) {
    this.name = summary.name
    this.lastUpdate = summary.lastUpdate
      ? new Date(summary.lastUpdate)
      : undefined
    this.updateInProgress = summary.updateInProgress
    this.resourceCount = summary.resourceCount
    this.workDir = workDir
  }

  async getTag(tag: string): Promise<string | null> {
    try {
      const value = await cmd.exec(
        `pulumi stack tag get ${tag} --stack ${this.name} --cwd ${this.workDir}`
      )
      return value.trim()
    } catch (e) {
      if (e.message?.includes(`stack tag '${tag}' not found`)) {
        return null
      }
      throw e
    }
  }
}
