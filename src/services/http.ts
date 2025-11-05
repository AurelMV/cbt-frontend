const BASE = import.meta.env.VITE_BASE_URL_API as string

if (!BASE) {
  // Aviso temprano en consola si no está configurada la URL
  console.warn("[services] VITE_BASE_URL_API no está definida. Configura el archivo .env en el frontend.")
}

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE"

export async function http<T>(path: string, opts?: { method?: HttpMethod; body?: unknown; headers?: Record<string, string> }) {
  const url = `${BASE}${path}`
  const method = opts?.method ?? "GET"
  const hasBody = opts?.body != null
  const headers: Record<string, string> = {
    ...(opts?.headers ?? {}),
  }
  // Importante para CORS: no enviar Content-Type en GET (evita preflight innecesario)
  if (hasBody) headers["Content-Type"] = "application/json"

  const res = await fetch(url, {
    method,
    headers,
    body: hasBody ? JSON.stringify(opts!.body) : undefined,
  })

  const text = await res.text()
  const isJson = res.headers.get("content-type")?.includes("application/json")
  const data = isJson && text ? JSON.parse(text) : text

  if (!res.ok) {
    const detail = typeof data === "object" && data && "detail" in data ? (data as any).detail : res.statusText
    throw new Error(typeof detail === "string" ? detail : "Error en la solicitud")
  }

  return data as T
}

export const api = {
  get: <T>(path: string) => http<T>(path),
  post: <T>(path: string, body?: unknown) => http<T>(path, { method: "POST", body }),
  put: <T>(path: string, body?: unknown) => http<T>(path, { method: "PUT", body }),
  patch: <T>(path: string, body?: unknown) => http<T>(path, { method: "PATCH", body }),
  delete: <T>(path: string) => http<T>(path, { method: "DELETE" }),
}
