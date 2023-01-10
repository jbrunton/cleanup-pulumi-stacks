import {Check} from './check'
import {StackNamePolicy} from '@entities/policies'
import micromatch from 'micromatch'

export const StackNameCheck = (policy: StackNamePolicy): Check => {
  return async stack => {
    const isLegacy = micromatch.isMatch(stack.name, policy.pattern)
    const description = `checked name [${stack.name}] against pattern [${policy.pattern}]`
    return {
      isLegacy,
      description
    }
  }
}
