import { spawn } from 'node:child_process'

export interface ExecAsyncOptions {
  cwd?: string
  env?: NodeJS.ProcessEnv
}

export async function execAsync(command: string, args: string[], options: ExecAsyncOptions = {}): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const child = spawn(command, args, {
      ...options,
      shell: true,
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
