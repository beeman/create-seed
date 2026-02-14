import { cpSync, existsSync, readdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { downloadTemplate } from 'giget'
import type { TemplateInfo } from './find-template.ts'

export async function cloneTemplate(template: TemplateInfo, targetDir: string): Promise<void> {
  const dir = resolve(targetDir)

  if (existsSync(dir)) {
    throw new Error(`Target directory already exists: ${dir}`)
  }

  if (template.mode === 'local') {
    const src = resolve(template.id)
    if (!existsSync(src)) {
      throw new Error(`Local template not found: ${src}`)
    }
    cpSync(src, dir, { recursive: true })
  } else {
    await downloadTemplate(template.id, { dir })
  }

  // Verify the cloned directory isn't empty
  const files = readdirSync(dir)
  if (files.length === 0) {
    throw new Error(`Template cloned but directory is empty: ${dir}`)
  }
}
