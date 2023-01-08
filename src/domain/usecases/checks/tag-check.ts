import micromatch from 'micromatch'
import {TagSpec} from '../get-legacy-stacks'
import {CheckResult} from './check'

export const TagCheck = (
  tagSpec: TagSpec,
  tagValues: Record<string, string>
): (() => CheckResult) => {
  return () => {
    const value = tagValues[tagSpec.tag]
    const isLegacy = value ? micromatch.isMatch(value, tagSpec.patterns) : false
    const description = `checked tag [${tagSpec.tag}=${value}] against patterns [${tagSpec.patterns}]`
    return {
      isLegacy,
      description
    }
  }
}
