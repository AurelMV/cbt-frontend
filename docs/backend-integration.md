# Integración Backend – Instituto CBT

Este documento describe los contratos mínimos de API y recomendaciones para integrar el frontend con el backend.

## Autenticación
- Método: Bearer Token (JWT) vía `Authorization: Bearer <token>`.
- Endpoints:
  - POST `/api/auth/login` { email, password } → { accessToken, user: { id, rol } }
  - POST `/api/auth/logout` → 204

## Inscripciones
- POST `/api/inscripciones`
  - Body (multipart/form-data cuando incluya `documento`):
    - dni: string (8 dígitos)
    - nombres: string
    - apellidos: string
    - nacimiento: string (YYYY-MM-DD)
    - email: string
    - telefono?: string
    - programa: string (id)
    - documento?: File (pdf/jpg/png ≤ 5MB)
  - Respuesta 201: { referencia: string, status: "pendiente" }

- GET `/api/programas` → [{ id, nombre, estado }]

## Pagos
- GET `/api/alumnos/:dni` → { dni, nombre, email, programas: [ { id, nombre } ], historialPagos: [...] }
- POST `/api/pagos`
  - Body (multipart/form-data):
    - dni: string
    - ciclo: string
    - comprobante: string
    - fecha: string (YYYY-MM-DD)
    - monto: number
    - banco: string
    - archivo: File (pdf/jpg/png ≤ 5MB)
  - Respuesta 201: { id, estado: "pendiente-validacion" }

## Asistencias (Docente)
- GET `/api/asistencias?ciclo={id}` → { fechas: string[], alumnos: [{ dni, nombre, email, estado }] }
- POST `/api/asistencias`
  - Body: { ciclo: string, fecha: string, marcas: Array<{ dni: string, marca: "P" | "T" | "F" }> }

## Administración
- GET `/api/admin/kpis` → { inscripcionesPendientes: number, pagosPorValidar: number, ciclosActivos: number, docentesAutorizados: number }
- CRUD `/api/programas`, `/api/grupos`, `/api/clases`, `/api/ciclos`
- GET `/api/reportes?tipo=...` → Blob (PDF)

## Errores & Mensajes
- Usar códigos estándar (400/401/403/404/409/422/500).
- Respuesta de error: { message: string, fieldErrors?: Record<string, string> }
- El frontend mostrará errores por campo (si `fieldErrors`) y un resumen superior.

## Seguridad
- Sanitizar strings del backend antes de renderizar HTML (DOMPurify si aplica).
- Nunca retornar datos sensibles (passwords, tokens internos).
- Habilitar CORS por origen.

## Observaciones
- El frontend espera `application/json` por defecto; usar `multipart/form-data` en uploads.
- Respuestas con fechas en formato ISO (YYYY-MM-DD o ISO-8601 con zona).
