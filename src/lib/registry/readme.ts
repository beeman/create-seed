import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import type { Registry } from './types.ts'

interface RegistryMeta {
  description: string
  name: string
}

function readRegistryMeta(root: string): RegistryMeta {
  const pkgPath = join(root, 'package.json')
  if (existsSync(pkgPath)) {
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'))
    return {
      description: pkg.description ?? '',
      name: pkg.name ?? 'Templates',
    }
  }
  return { description: '', name: 'Templates' }
}

export function generateReadme(root: string, registry: Registry): string {
  const meta = readRegistryMeta(root)
  const lines: string[] = []

  lines.push(`# ${meta.name}`)
  lines.push('')
  if (meta.description) {
    lines.push(meta.description)
    lines.push('')
  }

  lines.push('## Available Templates')
  lines.push('')

  for (const template of registry.templates) {
    lines.push(`### \`${template.path}\``)
    lines.push('')
    if (template.description) {
      lines.push(template.description)
      lines.push('')
    }
    lines.push('```bash')
    lines.push(`bun x create-seed@latest my-app -t ${template.id}`)
    lines.push('```')
    lines.push('')
  }

  return lines.join('\n')
}

export function writeReadme(root: string, content: string): string {
  const filePath = join(root, 'README.md')
  writeFileSync(filePath, content)
  return filePath
}
