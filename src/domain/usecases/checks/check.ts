import {Stack} from '@entities/pulumi'

export interface CheckResult {
  isLegacy: boolean
  description: string
}

export type Check = (stack: Stack) => Promise<CheckResult>
