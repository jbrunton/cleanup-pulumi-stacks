import {StackSummary} from '@pulumi/pulumi/automation'
import {subHours} from 'date-fns'
import {CheckResult} from './check'

export const StackAgeCheck = (
  stack: StackSummary,
  timeoutHours: number
): (() => CheckResult) => {
  return () => {
    const stackAge = stack.lastUpdate ? new Date(stack.lastUpdate) : null
    const timeoutAge = subHours(new Date(), timeoutHours)
    const isLegacy = stackAge ? stackAge < timeoutAge : false
    const description = `checked stack age [${stackAge?.toISOString()}] against timeout [${timeoutHours} hours]`
    return {
      isLegacy,
      description
    }
  }
}
