import { isAbsolute } from 'node:path'
import { getTemplates, getTemplatesUrl, type Template } from './get-templates.ts'

export interface TemplateInfo {
  id: string
  mode: 'external' | 'local'
}

function isLocalTemplate(template: string): boolean {
  return (
    template.startsWith('./') ||
    template.startsWith('../') ||
    isAbsolute(template) ||
    /^[a-zA-Z]:[\\/]/.test(template) ||
    template.startsWith('\\\\')
  )
}

export async function findTemplate(template: string): Promise<TemplateInfo> {
  // Local path (POSIX, Windows drive letter, UNC)
  if (isLocalTemplate(template)) {
    return { id: template, mode: 'local' }
  }

  // External template (contains a slash, e.g. "owner/repo" or "gh:owner/repo")
  if (template.includes('/')) {
    const id = template.includes(':') ? template : `gh:${template}`
    return { id, mode: 'external' }
  }

  // Short name — look up in the registry
  const templates = await getTemplates(getTemplatesUrl())
  const match = templates.find((t: Template) => t.name === template)
  if (match?.id) {
    return { id: match.id, mode: 'external' }
  }

  const available = templates.map((t: Template) => t.name).join(', ')
  throw new Error(
    `Unknown template: "${template}". Available templates: ${available || 'none'}. Or use a GitHub path (e.g. gh:owner/repo/path).`,
  )
}
