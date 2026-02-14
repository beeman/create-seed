import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import * as p from '@clack/prompts'
import { createApp } from './lib/create-app.ts'
import { detectPm } from './lib/detect-pm.ts'
import { getAppInfo } from './lib/get-app-info.ts'
import { getArgs } from './lib/get-args.ts'

export { getAppInfo }

export async function main(argv: string[]): Promise<void> {
  const args = getArgs(argv)
  const { name, version } = getAppInfo()

  p.intro(`${name} ${version}`)

  if (!args.name) {
    p.cancel('Project name is required. Usage: create-seed <name> -t <template>')
    process.exit(1)
  }

  if (!args.template) {
    p.cancel('Template is required. Usage: create-seed <name> -t <template>')
    process.exit(1)
  }

  const targetDir = resolve(args.name)

  if (args.dryRun) {
    p.note(
      [
        `Name:       ${args.name}`,
        `Template:   ${args.template}`,
        `Target:     ${targetDir}`,
        `PM:         ${args.pm ?? 'auto-detect'}`,
        `Skip git:   ${args.skipGit}`,
        `Skip install: ${args.skipInstall}`,
      ].join('\n'),
      'Dry run',
    )
    p.outro('Dry run complete — no files were created.')
    return
  }

  try {
    await createApp({ args, targetDir })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    p.cancel(`Failed: ${message}`)
    if (args.verbose && error instanceof Error && error.stack) {
      console.error(error.stack)
    }
    process.exit(1)
  }

  const pm = detectPm(args.pm)
  const steps = [`cd ${args.name}`]

  // Suggest a run command based on what scripts the template actually has
  const pkgPath = resolve(targetDir, 'package.json')
  if (existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'))
      const scripts = Object.keys(pkg.scripts ?? {})
      const runScript = ['dev', 'start', 'build'].find((s) => scripts.includes(s))
      if (runScript) {
        steps.push(`${pm} run ${runScript}`)
      }
    } catch {
      // ignore
    }
  }

  p.note(steps.join('\n'), 'Next steps')

  p.outro('Done! 🌱')
}
