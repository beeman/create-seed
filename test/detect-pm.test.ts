import { afterEach, describe, expect, test } from 'bun:test'
import { detectPm } from '../src/lib/detect-pm.ts'

describe('detectPm', () => {
  const originalAgent = process.env.npm_config_user_agent

  afterEach(() => {
    if (originalAgent === undefined) {
      delete process.env.npm_config_user_agent
    } else {
      process.env.npm_config_user_agent = originalAgent
    }
  })

  test('returns explicit pm when provided', () => {
    expect(detectPm('npm')).toBe('npm')
    expect(detectPm('pnpm')).toBe('pnpm')
    expect(detectPm('bun')).toBe('bun')
  })

  test('throws for invalid explicit pm', () => {
    expect(() => detectPm('yarn')).toThrow('Invalid package manager')
  })

  test('detects pnpm from user agent', () => {
    process.env.npm_config_user_agent = 'pnpm/8.0.0'
    expect(detectPm()).toBe('pnpm')
  })

  test('detects npm from user agent', () => {
    process.env.npm_config_user_agent = 'npm/10.0.0'
    expect(detectPm()).toBe('npm')
  })

  test('detects bun from user agent', () => {
    process.env.npm_config_user_agent = 'bun/1.0.0'
    expect(detectPm()).toBe('bun')
  })

  test('defaults to bun when no user agent', () => {
    delete process.env.npm_config_user_agent
    expect(detectPm()).toBe('bun')
  })
})
