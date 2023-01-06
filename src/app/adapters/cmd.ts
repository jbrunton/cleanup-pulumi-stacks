import * as process from 'child_process'

export const exec = (cmd: string) => {
  return new Promise<string>((resolve, reject) => {
    process.exec(cmd, (error, stdout) => {
      if (error) {
        reject(error)
      }
      resolve(stdout)
    })
  })
}
