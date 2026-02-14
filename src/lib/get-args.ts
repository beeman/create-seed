import { Command } from 'commander'
import { getAppInfo } from './get-app-info.ts'

export interface Args {
  dryRun: boolean
  name: string | undefined
  pm: string | undefined
  skipGit: boolean
  skipInstall: boolean
  template: string | undefined
  verbose: boolean
}

export function getArgs(argv: string[]): Args {
  const { name, version } = getAppInfo()
  const program = new Command()

  program
    .name(name)
    .description('Scaffold a new project from a template')
    .version(version)
    .argument('[name]', 'Project name')
    .option('-t, --template <template>', 'Template to use (gh:owner/repo/path or local path)')
    .option('--pm <pm>', 'Package manager (npm|pnpm|bun, default: auto-detect)')
    .option('--skip-git', 'Skip git initialization', false)
    .option('--skip-install', 'Skip installing dependencies', false)
    .option('-d, --dry-run', 'Dry run', false)
    .option('-v, --verbose', 'Verbose output', false)
    .parse(argv)

  const opts = program.opts()

  return {
    dryRun: opts.dryRun,
    name: program.args[0],
    pm: opts.pm,
    skipGit: opts.skipGit,
    skipInstall: opts.skipInstall,
    template: opts.template,
    verbose: opts.verbose,
  }
}
