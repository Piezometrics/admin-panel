import { useEffect, useRef, useState } from 'react'

type CacheEntry<T> = {
  data?: T
  error?: Error
  promise?: Promise<void>
}

const cache = new Map<string, CacheEntry<unknown>>()
const listeners = new Map<string, Set<() => void>>()

function emit(key: string) {
  listeners.get(key)?.forEach(listener => listener())
}

function subscribe(key: string, listener: () => void) {
  const existing = listeners.get(key) ?? new Set<() => void>()
  existing.add(listener)
  listeners.set(key, existing)

  return () => {
    const current = listeners.get(key)
    if (!current) return
    current.delete(listener)
    if (current.size === 0) listeners.delete(key)
  }
}

export function invalidateQuery(key: string) {
  cache.delete(key)
  emit(key)
}

export function invalidateQueries(prefix: string) {
  for (const key of cache.keys()) {
    if (key.startsWith(prefix)) {
      cache.delete(key)
      emit(key)
    }
  }
}

export function useCachedQuery<T>(key: string, fetcher: () => Promise<T>) {
  const [, forceRender] = useState(0)
  const fetcherRef = useRef(fetcher)
  fetcherRef.current = fetcher

  async function load(force = false) {
    const existing = cache.get(key) as CacheEntry<T> | undefined
    if (!force && existing?.promise) {
      await existing.promise
      return
    }

    const pending = (async () => {
      try {
        const data = await fetcherRef.current()
        cache.set(key, { data })
      } catch (error) {
        cache.set(key, { error: error instanceof Error ? error : new Error('Request failed') })
      } finally {
        emit(key)
      }
    })()

    cache.set(key, {
      data: force ? existing?.data : existing?.data,
      promise: pending,
    })
    emit(key)
    await pending
  }

  useEffect(() => subscribe(key, () => forceRender(value => value + 1)), [key])

  useEffect(() => {
    const existing = cache.get(key) as CacheEntry<T> | undefined
    if (!existing || (!existing.data && !existing.promise && !existing.error)) {
      void load()
    }
  }, [key])

  const entry = cache.get(key) as CacheEntry<T> | undefined

  return {
    data: entry?.data,
    error: entry?.error?.message ?? null,
    isLoading: !entry || Boolean(entry.promise),
    refresh: () => load(true),
  }
}