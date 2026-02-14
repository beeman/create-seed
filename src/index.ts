import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import * as p from '@clack/prompts'
import { createApp } from './lib/create-app.ts'
import { detectPm } from './lib/detect-pm.ts'
import { getAppInfo } from './lib/get-app-info.ts'
import { getArgs } from './lib/get-args.ts'
import { getTemplates, type Template } from './lib/get-templates.ts'

export { getAppInfo }

const CUSTOM_TEMPLATE = '__custom__'

async function promptText(options: Parameters<typeof p.text>[0]): Promise<string> {
  const value = await p.text(options)
  if (p.isCancel(value)) {
    p.cancel('Cancelled.')
    process.exit(0)
  }
  return value.trim()
}

function promptName(): Promise<string> {
  return promptText({
    message: 'Project name',
    placeholder: 'my-app',
    validate: (v = '') => {
      if (!v.trim()) {
        return 'Project name is required'
      }
      if (/[^a-z0-9._-]/i.test(v.trim())) {
        return 'Invalid characters in project name'
      }
    },
  })
}

function promptCustomTemplate(): Promise<string> {
  return promptText({
    message: 'Template',
    placeholder: 'gh:owner/repo/path',
    validate: (v = '') => {
      if (!v.trim()) {
        return 'Template is required'
      }
    },
  })
}

async function promptTemplate(templates: Template[]): Promise<string> {
  if (templates.length === 0) {
    return promptCustomTemplate()
  }

  const value = await p.select({
    message: 'Select a template',
    options: [
      ...templates.map((t) => ({
        hint: t.description,
        label: t.name,
        value: t.repo,
      })),
      { hint: 'Enter a custom template path', label: 'Custom', value: CUSTOM_TEMPLATE },
    ],
  })

  if (p.isCancel(value)) {
    p.cancel('Cancelled.')
    process.exit(0)
  }

  if (value === CUSTOM_TEMPLATE) {
    return promptCustomTemplate()
  }

  return value
}

async function fetchTemplatesSafe(url: string): Promise<Template[]> {
  try {
    return await getTemplates(url)
  } catch {
    return []
  }
}

function formatTemplateList(templates: Template[]): string {
  const maxName = Math.max(...templates.map((t) => t.name.length))
  const pad = maxName + 2
  return templates.map((t) => `  ${t.name.padEnd(pad)} ${t.description}`).join('\n')
}

export async function main(argv: string[]): Promise<void> {
  const args = getArgs(argv)
  const { name, version } = getAppInfo()

  p.intro(`${name} ${version}`)

  // Handle --list
  if (args.list) {
    try {
      const templates = await getTemplates(args.templatesUrl)
      if (templates.length === 0) {
        p.log.warn('No templates found.')
      } else {
        p.note(formatTemplateList(templates), 'Available templates')
      }
    } catch (error) {
      p.log.error(error instanceof Error ? error.message : String(error))
    }
    p.outro(`Use: ${name} <project> -t <template-name-or-repo>`)
    return
  }

  const projectName = args.name ?? (await promptName())

  // Resolve template: CLI arg, or interactive select from registry
  let template = args.template
  if (!template) {
    const templates = await fetchTemplatesSafe(args.templatesUrl)
    template = await promptTemplate(templates)
  }

  const targetDir = resolve(projectName)

  if (existsSync(targetDir)) {
    const overwrite = await p.confirm({
      initialValue: false,
      message: `Directory "${projectName}" already exists. Overwrite?`,
    })
    if (p.isCancel(overwrite) || !overwrite) {
      p.cancel('Cancelled.')
      process.exit(0)
    }
  }

  if (args.dryRun) {
    p.note(
      [
        `Name:       ${projectName}`,
        `Template:   ${template}`,
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
    await createApp({ args: { ...args, name: projectName, template }, targetDir })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    p.cancel(`Failed: ${message}`)
    if (args.verbose && error instanceof Error && error.stack) {
      console.error(error.stack)
    }
    process.exit(1)
  }

  const pm = detectPm(args.pm)
  const steps = [`cd ${projectName}`]

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
