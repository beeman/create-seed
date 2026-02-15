import { getTemplates, getTemplatesUrl, type Template } from './get-templates.ts'

export interface TemplateInfo {
  id: string
  mode: 'external' | 'local'
}

export async function findTemplate(template: string): Promise<TemplateInfo> {
  // Local path
  if (template.startsWith('./') || template.startsWith('../') || template.startsWith('/')) {
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
