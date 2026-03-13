import { afterAll, beforeEach, describe, expect, test } from 'bun:test'
import { isNoDna } from '../src/lib/is-no-dna.ts'

describe('isNoDna', () => {
  const originalNoDna = process.env.NO_DNA

  beforeEach(() => {
    delete process.env.NO_DNA
  })

  afterAll(() => {
    if (originalNoDna === undefined) {
      delete process.env.NO_DNA
    } else {
      process.env.NO_DNA = originalNoDna
    }
  })

  test('returns false when NO_DNA is missing', () => {
    expect(isNoDna()).toBe(false)
  })

  test('returns false when NO_DNA is an empty string', () => {
    process.env.NO_DNA = ''
    expect(isNoDna()).toBe(false)
  })

  test('returns false when NO_DNA is whitespace', () => {
    process.env.NO_DNA = '   '
    expect(isNoDna()).toBe(false)
  })

  test('returns true when NO_DNA is set', () => {
    process.env.NO_DNA = '1'
    expect(isNoDna()).toBe(true)
  })
})
