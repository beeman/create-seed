import { afterAll, beforeAll, describe, expect, test } from 'bun:test'
import { resolve } from 'node:path'
import { findTemplate } from '../src/lib/find-template.ts'

const originalUrl = process.env.TEMPLATES_URL

beforeAll(() => {
  process.env.TEMPLATES_URL = resolve(import.meta.dirname, 'fixtures/templates.json')
})

afterAll(() => {
  if (originalUrl !== undefined) {
    process.env.TEMPLATES_URL = originalUrl
  } else {
    delete process.env.TEMPLATES_URL
  }
})

describe('findTemplate', () => {
  test('treats paths starting with ./ as local', async () => {
    expect(await findTemplate('./my-template')).toEqual({ id: './my-template', mode: 'local' })
  })

  test('treats paths starting with ../ as local', async () => {
    expect(await findTemplate('../templates/foo')).toEqual({ id: '../templates/foo', mode: 'local' })
  })

  test('treats absolute paths as local', async () => {
    expect(await findTemplate('/tmp/my-template')).toEqual({ id: '/tmp/my-template', mode: 'local' })
  })

  test('treats owner/repo as external with gh: prefix', async () => {
    expect(await findTemplate('beeman/templates')).toEqual({ id: 'gh:beeman/templates', mode: 'external' })
  })

  test('treats gh:owner/repo as external without double-prefixing', async () => {
    expect(await findTemplate('gh:beeman/templates')).toEqual({ id: 'gh:beeman/templates', mode: 'external' })
  })

  test('treats owner/repo/path as external', async () => {
    expect(await findTemplate('beeman/templates/bun-library')).toEqual({
      id: 'gh:beeman/templates/bun-library',
      mode: 'external',
    })
  })

  test('resolves short name from registry', async () => {
    const result = await findTemplate('test-library')
    expect(result).toEqual({ id: 'gh:test-owner/templates/test-library', mode: 'external' })
  })

  test('treats Windows drive letter paths as local', async () => {
    expect(await findTemplate('C:\\Users\\dev\\template')).toEqual({
      id: 'C:\\Users\\dev\\template',
      mode: 'local',
    })
  })

  test('treats UNC paths as local', async () => {
    expect(await findTemplate('\\\\server\\share\\template')).toEqual({
      id: '\\\\server\\share\\template',
      mode: 'local',
    })
  })

  test('throws for unknown short name', async () => {
    expect(findTemplate('nonexistent-template')).rejects.toThrow('Unknown template')
  })
})
