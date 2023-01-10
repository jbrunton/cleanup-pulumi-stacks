import {parsePolicies} from '@usecases/parse-policies'

describe('parsePolicies', () => {
  it('parses valid yaml', () => {
    const yaml = `
      policies:
        clean-staging:
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
        clean-without-match:
          ttl:
            hours: 3
    `
    const policy = parsePolicies(yaml)
    expect(policy).toEqual([
      {
        name: 'clean-staging',
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
      },
      {
        name: 'clean-without-match',
        ttl: {hours: 3}
      }
    ])
  })
})
