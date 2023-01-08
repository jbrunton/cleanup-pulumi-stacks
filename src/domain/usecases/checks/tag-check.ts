import {Check} from './check'
import {TagSpec} from '../check-legacy-stack'
import micromatch from 'micromatch'

export const TagCheck = (tagSpec: TagSpec): Check => {
  return async stack => {
    const value = await stack.getTag(tagSpec.tag)
    const isLegacy = value ? micromatch.isMatch(value, tagSpec.patterns) : false
    const description = `checked tag [${tagSpec.tag}=${value}] against patterns [${tagSpec.patterns}]`
    return {
      isLegacy,
      description
    }
  }
}
