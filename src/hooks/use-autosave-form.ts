import { useEffect, useRef } from "react"
import type { FieldValues, UseFormReturn } from "react-hook-form"

export function useAutoSaveForm<T extends FieldValues>({ form, storageKey, intervalMs = 2000 }: { form: UseFormReturn<T>, storageKey: string, intervalMs?: number }) {
  const timer = useRef<number | null>(null)

  // Cargar valores iniciales
  useEffect(() => {
    const raw = localStorage.getItem(storageKey)
    if (raw) {
      try {
        const data = JSON.parse(raw)
        form.reset({ ...(form.getValues() as T), ...data })
      } catch (err) {
        if (import.meta.env.DEV) {
          // eslint-disable-next-line no-console
          console.warn("useAutoSaveForm: no se pudo parsear el estado almacenado", err)
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey])

  // Guardado automático
  useEffect(() => {
    const subscription = form.watch((values) => {
      if (timer.current) {
        window.clearTimeout(timer.current)
      }
      timer.current = window.setTimeout(() => {
        try {
          localStorage.setItem(storageKey, JSON.stringify(values))
        } catch (err) {
          if (import.meta.env.DEV) {
            // eslint-disable-next-line no-console
            console.warn("useAutoSaveForm: no se pudo guardar en localStorage", err)
          }
        }
      }, intervalMs) as unknown as number
    })
    return () => subscription.unsubscribe()
  }, [form, intervalMs, storageKey])

  const clear = () => localStorage.removeItem(storageKey)

  return { clear }
}
