import { arch, platform, release } from 'node:os'

const UMAMI_URL = 'https://stats.colmena.dev'
const UMAMI_WEBSITE_ID = '3a666bd8-e35f-4da9-b160-3e38601e08c7'
const TIMEOUT_MS = 3000

export interface TelemetryEvent {
  event: 'create' | 'create-failed'
  data: Record<string, string | boolean | undefined>
}

function isDisabled(): boolean {
  return process.env.DO_NOT_TRACK === '1' || process.env.DO_NOT_TRACK === 'true' || process.env.CI === 'true'
}

export async function trackEvent({ event, data }: TelemetryEvent): Promise<void> {
  if (isDisabled()) {
    return
  }

  const payload = {
    payload: {
      data: {
        ...data,
        arch: arch(),
        nodeVersion: process.version,
        os: platform(),
        osRelease: release(),
      },
      hostname: 'create-seed.cli',
      language: '',
      referrer: '',
      screen: '',
      title: event,
      url: `/${event}`,
      website: UMAMI_WEBSITE_ID,
    },
    type: 'event',
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS)

  try {
    await fetch(`${UMAMI_URL}/api/send`, {
      body: JSON.stringify(payload),
      headers: { 'Content-Type': 'application/json', 'User-Agent': 'create-seed' },
      method: 'POST',
      signal: controller.signal,
    })
  } catch {
    // Silently ignore telemetry failures
  } finally {
    clearTimeout(timeout)
  }
}
