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
        config: 'test: config',
        'working-directory': '.'
      },
      {
        preview: true
      }
    )

    const inputs = getInputs(core)

    expect(inputs).toEqual({
      config: 'test: config',
      preview: true,
      verbose: false,
      workDir: '.'
    })
  })
})
