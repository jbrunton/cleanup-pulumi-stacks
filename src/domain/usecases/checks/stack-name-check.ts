import {Check} from './check'
import {StackNamePolicy} from '@entities/policies'
import micromatch from 'micromatch'

export const StackNameCheck = (policy: StackNamePolicy): Check => {
  return async stack => {
    const isLegacy = micromatch.isMatch(stack.name, policy.patterns)
    const description = `checked name [${stack.name}] against patterns [${policy.patterns}]`
    return {
      isLegacy,
      description
    }
  }
}
