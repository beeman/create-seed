import packageJson from '../../package.json' with { type: 'json' }

export interface AppInfo {
  name: string
  version: string
}

export function getAppInfo(): AppInfo {
  return {
    name: packageJson.name ?? 'create-seed',
    version: packageJson.version ?? '0.0.0',
  }
}
