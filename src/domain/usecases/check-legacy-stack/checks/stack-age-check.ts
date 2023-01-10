import {TTLPolicy, isValidTTL} from '@entities/policies'
import {formatDuration, sub} from 'date-fns'
import {Check} from './check'

export const StackAgeCheck = (policy: TTLPolicy): Check => {
  if (!isValidTTL(policy)) {
    throw new Error('Invalid TTL policy')
  }
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
