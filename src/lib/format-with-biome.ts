import { access } from 'node:fs/promises'
import { resolve } from 'node:path'
import { execAsync } from './exec-async.ts'

export async function formatWithBiome(targetDir: string): Promise<'formatted' | 'skipped' | 'failed'> {
  try {
    await Promise.any([access(resolve(targetDir, 'biome.json')), access(resolve(targetDir, 'biome.jsonc'))])
  } catch {
    // All access calls failed, so no biome config found.
    return 'skipped'
  }

  try {
    await execAsync('npx', ['@biomejs/biome', 'check', '--write', '.'], { cwd: targetDir })
    return 'formatted'
  } catch (error) {
    // Best-effort — don't fail the scaffold if biome formatting fails
    console.warn('Warning: Failed to format with Biome.', error)
    return 'failed'
  }
}
