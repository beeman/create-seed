export function isNoDna(): boolean {
  return !!process.env.NO_DNA?.trim()
}
