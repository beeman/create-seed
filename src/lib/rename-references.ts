import { readdir, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

const IGNORE_DIRS = new Set(['.git', 'node_modules', '.next', 'dist', '.output', '.nuxt', '.turbo'])

const TEXT_EXTENSIONS = new Set([
  '.ts',
  '.tsx',
  '.js',
  '.jsx',
  '.mjs',
  '.cjs',
  '.json',
  '.md',
  '.mdx',
  '.yml',
  '.yaml',
  '.toml',
  '.html',
  '.css',
  '.scss',
  '.svg',
  '.env',
  '.env.example',
  '.env.local',
  '.prettierrc',
  '.eslintrc',
])

const EXTENSIONLESS_TEXT_FILES = new Set(['LICENSE', 'Makefile', 'README'])

function isTextFile(filename: string): boolean {
  // Dotfiles without extension (e.g. .gitignore) are text
  if (filename.startsWith('.') && !filename.includes('.', 1)) return true

  if (!filename.includes('.')) {
    return EXTENSIONLESS_TEXT_FILES.has(filename)
  }

  const ext = filename.slice(filename.lastIndexOf('.'))
  return TEXT_EXTENSIONS.has(ext)
}

async function walkFiles(dir: string): Promise<string[]> {
  const dirents = await readdir(dir, { withFileTypes: true })
  const files = await Promise.all(
    dirents.map(async (dirent) => {
      if (IGNORE_DIRS.has(dirent.name)) {
        return []
      }
      const fullPath = join(dir, dirent.name)
      if (dirent.isDirectory()) {
        return walkFiles(fullPath)
      }
      if (dirent.isFile() && isTextFile(dirent.name)) {
        return [fullPath]
      }
      return []
    }),
  )
  return files.flat()
}

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function buildPattern(name: string): RegExp {
  // Package names can contain @, /, - which aren't word chars,
  // so we use lookahead/lookbehind for word-char boundaries only
  // when the name starts/ends with a word character.
  const escaped = escapeRegExp(name)
  const prefix = /\w/.test(name.charAt(0)) ? '\\b' : ''
  const suffix = /\w/.test(name.charAt(name.length - 1)) ? '\\b' : ''
  return new RegExp(`${prefix}${escaped}${suffix}`, 'g')
}

export interface RenameResult {
  count: number
  files: string[]
}

export async function renameReferences(targetDir: string, oldNames: string[], newName: string): Promise<RenameResult> {
  // Deduplicate and filter out empty/identical names
  const names = [...new Set(oldNames.filter((n) => n && n !== newName))]
  if (names.length === 0) return { count: 0, files: [] }

  const patterns = names.map((name) => buildPattern(name))
  const files = await walkFiles(targetDir)
  const renamed: string[] = []

  for (const file of files) {
    const content = await readFile(file, 'utf-8')

    let updated = content
    for (const pattern of patterns) {
      pattern.lastIndex = 0
      updated = updated.replace(pattern, () => newName)
    }

    if (updated !== content) {
      await writeFile(file, updated)
      renamed.push(file)
    }
  }

  return { count: renamed.length, files: renamed }
}
