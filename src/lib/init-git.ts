import { execSync } from 'node:child_process'

function hasGit(): boolean {
  try {
    execSync('git --version', { stdio: 'ignore' })
    return true
  } catch {
    return false
  }
}

function getGitUser(): { name: string; email: string } {
  const name = execSafe('git config --global user.name') ?? 'seed'
  const email = execSafe('git config --global user.email') ?? 'seed@example.com'
  return { email, name }
}

function execSafe(cmd: string): string | undefined {
  try {
    return execSync(cmd, { windowsHide: true }).toString().trim() || undefined
  } catch {
    return undefined
  }
}

export async function initGit(targetDir: string): Promise<'initialized' | 'skipped'> {
  if (!hasGit()) {
    return 'skipped'
  }

  const { name, email } = getGitUser()
  const env = {
    ...process.env,
    GIT_AUTHOR_EMAIL: email,
    GIT_AUTHOR_NAME: name,
    GIT_COMMITTER_EMAIL: email,
    GIT_COMMITTER_NAME: name,
  }
  const run = (cmd: string) => execSync(cmd, { cwd: targetDir, env, stdio: 'ignore' })

  run('git init -b main')
  run('git add .')
  run('git commit -m "Initial commit"')

  return 'initialized'
}
