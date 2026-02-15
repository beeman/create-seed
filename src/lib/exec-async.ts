import { spawn } from 'node:child_process'

export interface ExecAsyncOptions {
  cwd?: string
  env?: NodeJS.ProcessEnv
  shell?: boolean
}

export async function execAsync(command: string, args: string[], options: ExecAsyncOptions = {}): Promise<void> {
  const { shell = false, ...rest } = options
  return new Promise<void>((resolve, reject) => {
    const child = spawn(command, args, {
      ...rest,
      shell,
      stdio: 'ignore',
    })
    child.on('error', reject)
    child.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`${command} ${args.join(' ')} failed with exit code ${code}`))
      } else {
        resolve()
      }
    })
  })
}
