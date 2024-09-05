export function createEvent<T extends (...args: unknown[]) => unknown>() {
  let listeners = [] as T[]
  return {
    on(fn: T) {
      listeners = [...listeners, fn]
    },
    off(fn: T) {
      listeners = listeners.filter((listener) => listener !== fn)
    },
    emit(...args: Parameters<T>) {
      listeners.forEach((listener) => listener(...args))
    },
  }
}
