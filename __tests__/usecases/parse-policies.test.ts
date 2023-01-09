import {parsePolicies} from '@usecases/parse-policies'

describe('parsePolicies', () => {
  it('parses valid yaml', () => {
    const yaml = `
      policies:
        clean-staging:
          match:
            tags:
              environment: dev*
          ttl:
            hours: 2
        clean-production:
          match:
            name: production
          ttl:
            hours: 3
    `
    const policy = parsePolicies(yaml)
    expect(policy).toEqual([
      {
        match: {
          tags: [{pattern: 'dev*', tag: 'environment'}]
        },
        name: 'clean-staging',
        ttl: {hours: 2}
      },
      {
        match: {
          name: {
            pattern: 'production'
          }
        },
        name: 'clean-production',
        ttl: {hours: 3}
      }
    ])
  })
})
