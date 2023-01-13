import {PolicyParser, isValidMatchPolicy, isValidTTL} from '@entities/policies'
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
  .refine(policies => policies.length > 0, {
    message: 'Policy must match on at least one tag'
  })

const MatchPolicy = z
  .object({
    name: z
      .string()
      .transform(pattern => ({pattern}))
      .optional(),
    tags: TagsPolicyParser.optional()
  })
  .refine(policy => isValidMatchPolicy(policy), {
    message: 'Policy must match on either name or tags'
  })

const CleanupPolicyParser = z
  .object({
    policies: z.record(
      z.object({
        match: MatchPolicy,
        ttl: TTLPolicyParser
      })
    )
  })
  .transform(arg =>
    Object.entries(arg.policies).map(([name, policy]) => ({name, ...policy}))
  )
  .refine(policies => policies.length > 0, {
    message: 'At least one policy must be defined'
  })

export const parsePolicies: PolicyParser = input => {
  const data = parse(input)
  return CleanupPolicyParser.parse(data)
}
