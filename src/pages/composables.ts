import { onMounted, onUnmounted } from 'vue'
import { createEvent } from './utils'

export function useAsyncEvent<T extends (...args: any[]) => void>(fn: T): T {
  const emitter = createEvent<T>()
  onMounted(() => emitter.on(fn))
  onUnmounted(() => emitter.off(fn))
  return ((...args: Parameters<T>) => emitter.emit(...args)) as T
}
