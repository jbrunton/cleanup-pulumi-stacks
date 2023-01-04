import {exec} from 'child_process'

const execCommand = (cmd: string) => {
  return new Promise<string>((resolve, reject) => {
    exec(cmd, (error, stdout) => {
      if (error) {
        reject(error)
      }
      resolve(stdout)
    })
  })
}

export const getTagValue = async (
  stackName: string,
  tag: string,
  workDir: string
): Promise<string | null> => {
  try {
    const value = await execCommand(
      `pulumi stack tag get ${tag} --stack ${stackName} --cwd ${workDir}`
    )
    return value.trim()
  } catch (e) {
    if (e.message?.includes(`stack tag '${tag}' not found`)) {
      return null
    }
    throw e
  }
}
