import {PolicyParser} from '@entities/policies'
import {parse} from 'yaml'
import {split} from 'rambda'
import {z} from 'zod'

const TTLPolicyParser = z.object({
  hours: z.number().optional(),
  minutes: z.number().optional()
})

const TagsPolicyParser = z
  .record(z.string())
  .transform((arg: Record<string, string>, ctx) => {
    return Object.entries(arg).map(([tag, tagPatterns]) => {
      const patterns = split(',', tagPatterns)
      if (!patterns.length) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Missing patterns for tag: ${tag}`
        })
      }
      return {tag, patterns}
    })
  })

const MatchPolicy = z.object({
  // name: z.string(),
  tags: TagsPolicyParser
})

const CleanupPolicyParser = z
  .record(
    z.object({
      match: MatchPolicy,
      ttl: TTLPolicyParser
    })
  )
  .transform(arg =>
    Object.entries(arg).map(([name, policy]) => ({name, ...policy}))
  )

export const parsePolicies: PolicyParser = input => {
  const data = parse(input)
  return CleanupPolicyParser.parse(data)
}
