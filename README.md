# create-seed 🌱

Scaffold a new project from a template. Fast, portable, zero config.

## Usage

```bash
# With bun
bun x create-seed@latest my-app -t gh:beeman/templates/bun-library

# With npx
npx create-seed@latest my-app -t gh:beeman/templates/bun-library

# With pnpx
pnpx create-seed@latest my-app -t gh:beeman/templates/bun-library
```

## Options

```
Usage: create-seed [options] [name]

Scaffold a new project from a template

Arguments:
  name                         Project name

Options:
  -V, --version                output the version number
  -t, --template <template>    Template to use (gh:owner/repo/path or local path)
  --pm <pm>                    Package manager (npm|pnpm|bun, default: auto-detect)
  --skip-git                   Skip git initialization (default: false)
  --skip-install               Skip installing dependencies (default: false)
  -d, --dry-run                Dry run (default: false)
  -v, --verbose                Verbose output (default: false)
  -h, --help                   display help for command
```

## Templates

Any GitHub repo (or subdirectory) works as a template:

```bash
# Full repo
bun x create-seed@latest my-app -t gh:owner/repo

# Subdirectory of a repo
bun x create-seed@latest my-app -t gh:owner/repo/path/to/template

# Local path
bun x create-seed@latest my-app -t ./my-local-template
```

### Available templates

| Template | Description |
|----------|-------------|
| `gh:beeman/templates/bun-library` | TypeScript library with Bun, tsup, Biome, Changesets |

## What it does

1. **Clones the template** — downloads from GitHub (via [giget](https://github.com/unjs/giget)) or copies from a local path
2. **Installs dependencies** — auto-detects your package manager (bun/npm/pnpm)
3. **Initializes git** — `git init` + initial commit (skips gracefully if git is not installed or not configured)

## Package manager detection

`create-seed` auto-detects which package manager you're using based on how you ran it:

| Command | Detected PM |
|---------|-------------|
| `bun x create-seed@latest` | bun |
| `npx create-seed@latest` | npm |
| `pnpx create-seed@latest` | pnpm |

Override with `--pm`:

```bash
bun x create-seed@latest my-app -t gh:owner/repo --pm bun
```

## Development

```bash
bun install
bun run build
bun run test
bun run lint
```

## License

MIT – see [LICENSE](./LICENSE).
