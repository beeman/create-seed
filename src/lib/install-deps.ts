import { execSync } from 'node:child_process'
import { existsSync, unlinkSync } from 'node:fs'
import { resolve } from 'node:path'
import { detectPm, type PackageManager } from './detect-pm.ts'

const LOCKFILES: Record<PackageManager, string> = {
  bun: 'bun.lock',
  npm: 'package-lock.json',
  pnpm: 'pnpm-lock.yaml',
}

export async function installDeps(targetDir: string, explicitPm?: string): Promise<PackageManager> {
  const pm = detectPm(explicitPm)

  // Delete lockfiles for other package managers
  for (const [key, lockfile] of Object.entries(LOCKFILES)) {
    if (key !== pm) {
      const lockPath = resolve(targetDir, lockfile)
      if (existsSync(lockPath)) {
        unlinkSync(lockPath)
      }
    }
  }

  execSync(`${pm} install`, { cwd: targetDir, stdio: 'ignore' })

  return pm
}
