import {formatDuration, sub} from 'date-fns'
import {Check} from './check'
import {TTLPolicy} from '@entities/policies'

export const StackAgeCheck = (policy: TTLPolicy): Check => {
  return async stack => {
    const stackAge = stack.lastUpdate
    const timeoutAge = sub(new Date(), policy)
    const isLegacy = stackAge ? stackAge < timeoutAge : false
    const description = `checked stack age [${stackAge?.toISOString()}] against ttl [${formatDuration(
      policy
    )}]`
    return {
      isLegacy,
      description
    }
  }
}
