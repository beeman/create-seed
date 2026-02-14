import { describe, expect, test } from 'bun:test'
import { findTemplate } from '../src/lib/find-template.ts'

describe('findTemplate', () => {
  test('treats paths starting with ./ as local', () => {
    expect(findTemplate('./my-template')).toEqual({ id: './my-template', mode: 'local' })
  })

  test('treats paths starting with ../ as local', () => {
    expect(findTemplate('../templates/foo')).toEqual({ id: '../templates/foo', mode: 'local' })
  })

  test('treats absolute paths as local', () => {
    expect(findTemplate('/tmp/my-template')).toEqual({ id: '/tmp/my-template', mode: 'local' })
  })

  test('treats owner/repo as external with gh: prefix', () => {
    expect(findTemplate('beeman/templates')).toEqual({ id: 'gh:beeman/templates', mode: 'external' })
  })

  test('treats gh:owner/repo as external without double-prefixing', () => {
    expect(findTemplate('gh:beeman/templates')).toEqual({ id: 'gh:beeman/templates', mode: 'external' })
  })

  test('treats owner/repo/path as external', () => {
    expect(findTemplate('beeman/templates/bun-library')).toEqual({
      id: 'gh:beeman/templates/bun-library',
      mode: 'external',
    })
  })

  test('throws for bare names without slash', () => {
    expect(() => findTemplate('my-template')).toThrow('Unknown template')
  })
})
