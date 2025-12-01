import { toast } from "sonner"

const BASE = import.meta.env.VITE_BASE_URL_API as string

if (!BASE) {
  // Aviso temprano en consola si no está configurada la URL
  console.warn("[services] VITE_BASE_URL_API no está definida. Configura el archivo .env en el frontend.")
}

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE"

type HttpOptions = {
  method?: HttpMethod
  body?: unknown
  headers?: Record<string, string>
  silentError?: boolean // Si true, no muestra toast de error global
  responseType?: 'json' | 'blob' | 'text'
}

export async function http<T>(path: string, opts?: HttpOptions) {
  const url = `${BASE}${path}`
  const method = opts?.method ?? "GET"
  const hasBody = opts?.body != null
  const headers: Record<string, string> = opts?.headers ? { ...opts.headers } : {}
  // Importante para CORS: no enviar Content-Type en GET (evita preflight innecesario)
  if (hasBody) headers["Content-Type"] = "application/json"

  const res = await fetch(url, {
    method,
    headers,
    body: hasBody ? JSON.stringify(opts.body) : undefined,
  })

  if (!res.ok) {
    let message = res.statusText
    try {
      const text = await res.text()
      const isJson = res.headers.get("content-type")?.includes("application/json")
      const data = isJson && text ? JSON.parse(text) : text
      const detail = typeof data === "object" && data && "detail" in data ? (data as Record<string, unknown>).detail : null
      if (typeof detail === "string" && detail.trim()) {
        message = detail
      }
    } catch (e) {
      // ignore error parsing
    }

    if (!opts?.silentError) {
      toast.error(message)
    }
    throw new Error(message)
  }

  if (opts?.responseType === 'blob') {
    return (await res.blob()) as unknown as T
  }

  const text = await res.text()
  const isJson = res.headers.get("content-type")?.includes("application/json")
  const data = isJson && text ? JSON.parse(text) : text

  return data as T
}

export const api = {
  get: <T>(path: string, opts?: Omit<HttpOptions, "method" | "body">) => http<T>(path, { ...opts, method: "GET" }),
  post: <T>(path: string, body?: unknown, opts?: Omit<HttpOptions, "method">) => http<T>(path, { ...opts, method: "POST", body }),
  put: <T>(path: string, body?: unknown, opts?: Omit<HttpOptions, "method">) => http<T>(path, { ...opts, method: "PUT", body }),
  patch: <T>(path: string, body?: unknown, opts?: Omit<HttpOptions, "method">) => http<T>(path, { ...opts, method: "PATCH", body }),
  delete: <T>(path: string, opts?: Omit<HttpOptions, "method" | "body">) => http<T>(path, { ...opts, method: "DELETE" }),
}
