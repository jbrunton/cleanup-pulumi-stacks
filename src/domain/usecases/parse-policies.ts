import {PolicyParser} from '@entities/policies'
import {parse} from 'yaml'
import {split} from 'rambda'
import {z} from 'zod'

const TTLPolicyParser = z.object({
  hours: z.number().optional(),
  minutes: z.number().optional()
})

const PatternsParser = z.string().transform((arg, ctx) => {
  const patterns = split(',', arg)
  if (!patterns.length) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Missing patterns'
    })
  }
  return patterns
})

const TagsPolicyParser = z
  .record(PatternsParser)
  .transform(arg =>
    Object.entries(arg).map(([tag, patterns]) => ({tag, patterns}))
  )

const MatchPolicy = z.object({
  name: PatternsParser.transform(patterns => ({patterns})).optional(),
  tags: TagsPolicyParser.optional()
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
