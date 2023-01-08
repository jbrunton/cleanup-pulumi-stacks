import {Check} from './check'
import {TagPolicy} from '@entities/policies'
import micromatch from 'micromatch'

export const TagCheck = (policy: TagPolicy): Check => {
  return async stack => {
    const value = await stack.getTag(policy.tag)
    const isLegacy = value ? micromatch.isMatch(value, policy.patterns) : false
    const description = `checked tag [${policy.tag}=${value}] against patterns [${policy.patterns}]`
    return {
      isLegacy,
      description
    }
  }
}
