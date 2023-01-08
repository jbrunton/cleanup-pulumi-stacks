import * as cmd from './cmd'

export const getTagValue = async (
  stackName: string,
  tag: string,
  workDir: string
): Promise<string | null> => {
  try {
    const value = await cmd.exec(
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
