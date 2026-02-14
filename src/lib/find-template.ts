export interface TemplateInfo {
  id: string
  mode: 'external' | 'local'
}

export function findTemplate(template: string): TemplateInfo {
  // Local path
  if (template.startsWith('./') || template.startsWith('../') || template.startsWith('/')) {
    return { id: template, mode: 'local' }
  }

  // External template (contains a slash, e.g. "owner/repo" or "gh:owner/repo")
  if (template.includes('/')) {
    const id = template.includes(':') ? template : `gh:${template}`
    return { id, mode: 'external' }
  }

  // No registry yet
  throw new Error(
    `Unknown template: "${template}". Use a GitHub path (e.g. gh:owner/repo/path) or a local path (e.g. ./my-template).`,
  )
}
