import { access, readFile, writeFile } from 'node:fs/promises'
import { basename, resolve } from 'node:path'

export interface RewriteResult {
  originalName: string | undefined
  newName: string
}

export async function rewritePackageJson(targetDir: string, projectName: string): Promise<RewriteResult> {
  const pkgPath = resolve(targetDir, 'package.json')
  const newName = basename(resolve(projectName))

  try {
    await access(pkgPath)
  } catch {
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

  return { newName, originalName }
}
