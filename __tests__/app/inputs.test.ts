import {ActionsCore, getInputs} from '@app/inputs'
import {pick} from 'rambda'

jest.mock('@actions/core')

describe('getInputs', () => {
  const stubInputs = (
    inputs: Record<string, string>,
    booleanInputs: Record<string, boolean>
  ): ActionsCore => ({
    getInput: (key: string): string => {
      return inputs[key] ?? ''
    },
    getBooleanInput: (key: string): boolean => {
      return booleanInputs[key] ?? false
    },
    info: () => {}
  })

  it('parses inputs', () => {
    const core = stubInputs(
      {
        config: `
        dev:
          match:
            tags:
              environment: staging, dev-*
          ttl:
            hours: 3
      `,
        'working-directory': '.'
      },
      {
        preview: true
      }
    )

    const inputs = getInputs(core)

    expect(inputs.policies).toEqual([
      {
        match: {
          tags: [{patterns: ['staging', ' dev-*'], tag: 'environment'}]
        },
        name: 'dev',
        ttl: {hours: 3}
      }
    ])

    expect(pick(['preview', 'workDir'], inputs.options)).toEqual({
      workDir: '.',
      preview: true
    })
  })
})
