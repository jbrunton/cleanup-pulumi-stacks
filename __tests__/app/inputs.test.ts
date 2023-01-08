import {ActionsCore, getInputs} from '@app/inputs'
import {pick} from 'rambda'

jest.mock('@actions/core')

describe('getInputs', () => {
  const stubInputs = (inputs: Record<string, string>): ActionsCore => ({
    getInput: (key: string): string => {
      return inputs[key] ?? ''
    }
  })

  it('parses inputs', () => {
    const core = stubInputs({
      'legacy-tags': `
        environment: staging, dev-*
        ttl: *
      `,
      'timeout-hours': '24',
      preview: 'true',
      'working-directory': '.'
    })

    const inputs = getInputs(core)

    expect(inputs.legacyStackSpec).toEqual({
      tags: [
        {tag: 'environment', patterns: ['staging', 'dev-*']},
        {tag: 'ttl', patterns: ['*']}
      ],
      timeoutHours: 24
    })

    expect(pick(['preview', 'workDir'], inputs.options)).toEqual({
      workDir: '.',
      preview: true
    })
  })
})
