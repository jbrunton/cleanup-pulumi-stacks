import {PolicyParser, isValidTTL} from '@entities/policies'
import {parse} from 'yaml'
import {z} from 'zod'

const TTLPolicyParser = z
  .object({
    days: z.number().optional(),
    hours: z.number().optional(),
    minutes: z.number().optional()
  })
  .refine(val => isValidTTL(val), {
    message: 'At least one of days, hours or minutes must be set'
  })

const TagsPolicyParser = z
  .record(z.string())
  .transform(arg =>
    Object.entries(arg).map(([tag, pattern]) => ({tag, pattern}))
  )

const MatchPolicy = z.object({
  name: z
    .string()
    .transform(pattern => ({pattern}))
    .optional(),
  tags: TagsPolicyParser.optional()
})

const CleanupPolicyParser = z
  .object({
    policies: z.record(
      z.object({
        match: MatchPolicy.optional(),
        ttl: TTLPolicyParser
      })
    )
  })
  .transform(arg =>
    Object.entries(arg.policies).map(([name, policy]) => ({name, ...policy}))
  )

export const parsePolicies: PolicyParser = input => {
  const data = parse(input)
  return CleanupPolicyParser.parse(data)
}
