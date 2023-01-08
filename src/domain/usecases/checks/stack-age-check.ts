import {Check} from './check'
import {subHours} from 'date-fns'

export const StackAgeCheck = (timeoutHours: number): Check => {
  return async stack => {
    const stackAge = stack.lastUpdate
    const timeoutAge = subHours(new Date(), timeoutHours)
    const isLegacy = stackAge ? stackAge < timeoutAge : false
    const description = `checked stack age [${stackAge?.toISOString()}] against timeout [${timeoutHours} hours]`
    return {
      isLegacy,
      description
    }
  }
}
