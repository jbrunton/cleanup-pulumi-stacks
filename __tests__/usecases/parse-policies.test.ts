import {parsePolicies} from '@usecases/parse-policies'
import {z} from 'zod'

describe('parsePolicies', () => {
  it('parses valid yaml', () => {
    const yaml = `
      policies:
        clean-dev:
          match:
            tags:
              environment: 'dev*'
          ttl:
            hours: 2
        clean-dev-and-staging:
          match:
            name: '!production'
          ttl:
            hours: 3
    `
    const policy = parsePolicies(yaml)
    expect(policy).toEqual([
      {
        name: 'clean-dev',
        match: {
          tags: [{pattern: 'dev*', tag: 'environment'}]
        },
        ttl: {hours: 2}
      },
      {
        name: 'clean-dev-and-staging',
        match: {
          name: {
            pattern: '!production'
          }
        },
        ttl: {hours: 3}
      }
    ])
  })

  describe('validation', () => {
    it('requires at least one policy', () => {
      expect(() => parsePolicies('')).toThrowError(
        new z.ZodError([
          {
            code: 'invalid_type',
            expected: 'object',
            received: 'null',
            path: [],
            message: 'Expected object, received null'
          }
        ])
      )
      expect(() => parsePolicies('policies: {}')).toThrowError(
        new z.ZodError([
          {
            code: 'custom',
            message: 'At least one policy must be defined',
            path: []
          }
        ])
      )
    })

    it('requires a TTL policy', () => {
      const yaml = `
      policies:
        missing-ttl:
          match:
            tags:
              environment: 'dev*'
      `
      expect(() => parsePolicies(yaml)).toThrowError(
        new z.ZodError([
          {
            code: 'invalid_type',
            expected: 'object',
            received: 'undefined',
            path: ['policies', 'missing-ttl', 'ttl'],
            message: 'Required'
          }
        ])
      )
    })

    it('requires a valid TTL policy', () => {
      const yaml = `
      policies:
        invalid-ttl:
          match:
            tags:
              environment: 'dev*'
          ttl: {}
      `
      expect(() => parsePolicies(yaml)).toThrowError(
        new z.ZodError([
          {
            code: 'custom',
            message: 'At least one of days, hours or minutes must be set',
            path: ['policies', 'invalid-ttl', 'ttl']
          },
          {
            code: 'custom',
            message: 'At least one policy must be defined',
            path: []
          }
        ])
      )
    })

    it('requires a match policy', () => {
      const yaml = `
      policies:
        missing-match:
          ttl:
            hours: 3
      `
      expect(() => parsePolicies(yaml)).toThrowError(
        new z.ZodError([
          {
            code: 'invalid_type',
            expected: 'object',
            received: 'undefined',
            path: ['policies', 'missing-match', 'match'],
            message: 'Required'
          }
        ])
      )
    })

    it('requires a valid match policy', () => {
      const yaml = `
      policies:
        invalid-match:
          ttl:
            hours: 3
          match: {}
      `
      expect(() => parsePolicies(yaml)).toThrowError(
        new z.ZodError([
          {
            code: 'custom',
            message: 'Policy must match on either name or tags',
            path: ['policies', 'invalid-match', 'match']
          },
          {
            code: 'custom',
            message: 'At least one policy must be defined',
            path: []
          }
        ])
      )
    })

    it('requires a valid tags policy', () => {
      const yaml = `
      policies:
        invalid-match:
          ttl:
            hours: 3
          match: {
            tags: {}
          }
      `
      expect(() => parsePolicies(yaml)).toThrowError(
        new z.ZodError([
          {
            code: 'custom',
            message: 'Policy must match on at least one tag',
            path: ['policies', 'invalid-match', 'match', 'tags']
          },
          {
            code: 'custom',
            message: 'Policy must match on either name or tags',
            path: ['policies', 'invalid-match', 'match']
          },
          {
            code: 'custom',
            message: 'At least one policy must be defined',
            path: []
          }
        ])
      )
    })
  })
})
