import { access, readFile, writeFile } from 'node:fs/promises'
import { basename, resolve } from 'node:path'
import { execAsync } from './exec-async.ts'

export interface RewriteResult {
  originalName: string | undefined
  newName: string
}

async function fileExists(path: string): Promise<boolean> {
  try {
    await access(path)
    return true
  } catch {
    return false
  }
}

export async function rewritePackageJson(targetDir: string, projectName: string): Promise<RewriteResult> {
  const pkgPath = resolve(targetDir, 'package.json')
  const newName = basename(resolve(projectName))
  if (!(await fileExists(pkgPath))) {
    return { newName, originalName: undefined }
  }

  const pkg: Record<string, unknown> = JSON.parse(await readFile(pkgPath, 'utf-8'))

  const originalName = typeof pkg.name === 'string' ? pkg.name : undefined
  pkg.name = newName
  pkg.version = '0.0.0'

  // Clear template-specific fields
  delete pkg.repository
  delete pkg.homepage
  delete pkg.bugs

  // Reset description
  pkg.description = ''

  await writeFile(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`)

  // If biome is configured, format the rewritten package.json
  if ((await fileExists(resolve(targetDir, 'biome.json'))) || (await fileExists(resolve(targetDir, 'biome.jsonc')))) {
    try {
      await execAsync('npx', ['@biomejs/biome', 'check', '--write', 'package.json'], { cwd: targetDir })
    } catch (error) {
      // Best-effort — don't fail the scaffold if biome formatting fails
      console.warn('Warning: Failed to format package.json with Biome.', error)
    }
  }

  return { newName, originalName }
}
