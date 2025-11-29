# CBT Backend API — Documentación de Endpoints

Esta guía resume todos los endpoints del backend, sus rutas, autenticación, parámetros y esquemas para implementar el frontend.

Base URL: `http://localhost:8000`
Prefijo global: `/api` (todas las rutas comienzan con `/api/...`)
Formato: JSON por defecto. En login se usa form-data (OAuth2 Password).

Nota sobre trailing slash: algunas rutas base pueden tener `/` final. Si llamas sin `/`, FastAPI puede responder 307 hacia la versión canónica.

---

## Autenticación

- Esquema: OAuth2 Password Bearer (JWT)
- Token URL: `POST /api/auth/login`
- El campo `username` acepta usuario o email; `password` es la contraseña.
- Usa el token en `Authorization: Bearer <token>` para endpoints protegidos.

### Endpoints de Auth

1. `POST /api/auth/register`

   - Body (UserCreate):
     - `username`: string
     - `email`: Email
     - `password`: string
   - Respuesta 201 (UserRead):
     - `id`, `username`, `email`, `roles`

2. `POST /api/auth/login`
   - Body (form-data): `username`, `password`
   - Respuesta 200 (Token): `access_token`, `token_type` = "bearer"

Scopes/roles:

- `GET /api/users/me`: scope `user`
- `GET /api/users/`: scope `admin`

---

## Esquemas Comunes

- Page[T]: esquema genérico de paginación usado en los listados.
  - `items`: lista de T (elementos de la página actual)
  - `total`: cantidad total de registros que cumplen el filtro
  - `pages`: cantidad de páginas, calculada como ceil(total/limit)
  - `limit`: tamaño de página solicitado
  - `offset`: desplazamiento aplicado
  - `page`: número de página actual (0-based)

Notas de uso:

- El query param `page` (si se envía) sobreescribe `offset` usando `offset = page * limit`.
- `page` es 0-based (la primera página es 0).
- Si `total` es 0, `pages` es 0.
- Los endpoints que soportan paginación también aceptan `q` para búsqueda simple según el módulo.

- Token: respuesta de autenticación.

  - `access_token`: string (JWT)
  - `token_type`: "bearer"

- Error: formato de error estándar FastAPI.
  - HTTPException: `{ "detail": string }`
  - ValidationError: `{ "detail": [ { "loc": [..], "msg": string, "type": string } ] }`

---

## Users

- Base: `/api/users`

1. `GET /api/users/me` (protegido: scope user) → UserRead
2. `GET /api/users/` (protegido: scope admin) → lista de UserRead

---

## Programas

- Base: `/api/programas`

1. `GET /api/programas/` → página de programas
   - Query: `offset` (0), `limit` (15), `page` (0-based, opcional), `q` (nombrePrograma)
   - Respuesta: Page[ProgramaRead] (`items`, `total`, `pages`, `limit`, `offset`, `page`)
2. `POST /api/programas/` → ProgramaCreate → ProgramaRead
3. `PUT /api/programas/{programa_id}` → ProgramaUpdate → ProgramaRead (404 si no existe)

---

## Ciclos

- Base: `/api/ciclos`

1. `GET /api/ciclos/` → página de ciclos
   - Query: `offset`, `limit`, `page`, `q` (nombreCiclo)
   - Respuesta: Page[CicloRead]
2. `POST /api/ciclos/` → CicloCreate → CicloRead
3. `PUT /api/ciclos/{ciclo_id}` → CicloUpdate → CicloRead (404 si no existe)

---

## Grupos

- Base: `/api/grupos`

1. `GET /api/grupos/` → página de grupos
   - Query: `offset`, `limit`, `page`, `q` (nombreGrupo)
   - Respuesta: Page[GrupoRead]
2. `POST /api/grupos/` → GrupoCreate → GrupoRead
3. `PUT /api/grupos/{grupo_id}` → GrupoUpdate → GrupoRead (400 FK inválida; 404 si no existe)

---

## Clases

- Base: `/api/clases`

1. `GET /api/clases/` → página de clases (q sobre `codigoClase`)
2. `POST /api/clases/` → ClaseCreate → ClaseRead
3. `PUT /api/clases/{clase_id}` → ClaseUpdate → ClaseRead (400 FK inválida; 404 si no existe)

---

## Alumnos

- Base: `/api/alumnos`
- `GET /api/alumnos/` → página (Page[AlumnoRead])
  - Query: `offset`, `limit`, `page`, `q` (nombre/apellidos/DNI/email)
  - Respuesta: `items`, `total`, `pages`, `limit`, `offset`, `page`
- `POST /api/alumnos/` → AlumnoCreate (requiere `idColegio` válido)

Esquemas (Alumno):

- Create: { `nombreAlumno`, `aMaterno`, `aPaterno`, `sexo`, `telefonoEstudiante`, `telefonoApoderado`,
  `fechaNacimiento`, `email`, `anoCulminado`, `Direccion`, `nroDocumento`, `idColegio` }
- Read: los campos anteriores + `id`

---

## Inscripciones

- Base: `/api/inscripciones`

1. `GET /api/inscripciones/` → página (Page[InscripcionRead])
   - Query: `offset`, `limit`, `page`, `q` (Codigo/EstadoPago/TipoPago)
2. `POST /api/inscripciones/` → InscripcionCreate (valida FKs)
3. `GET /api/inscripciones/buscar?dni={dni}&idCiclo={id}` → InscripcionLookupRead (404 si no existe)

---

## Pagos

- Base: `/api/pagos`
- `GET /api/pagos/` → página (Page[PagoRead])
  - Query: `offset`, `limit`, `page`, `q` (nroVoucher/medioPago)
- `POST /api/pagos/` → PagoCreate (requiere `idInscripcion` válido)

---

## Ubicación

### Departamentos

- Base: `/api/departamentos`
- `GET /api/departamentos/` → lista DepartamentoRead
- `POST /api/departamentos/` → DepartamentoCreate → DepartamentoRead

Esquemas:

- DepartamentoCreate: { `nombreDepartamento`: string }
- DepartamentoRead: { `id`, `nombreDepartamento` }

### Provincias

- Base: `/api/provincias`
- `GET /api/provincias/` → lista ProvinciaRead
- `POST /api/provincias/` → ProvinciaCreate (requiere `departamento_id` válido)

Esquemas:

- ProvinciaCreate: { `nombreProvincia`, `departamento_id` }
- ProvinciaRead: { `id`, `nombreProvincia`, `departamento_id` }

### Distritos

- Base: `/api/distritos`
- `GET /api/distritos/` → lista DistritoRead
- `POST /api/distritos/` → DistritoCreate (requiere `provincia_id` válido)

Esquemas:

- DistritoCreate: { `nombreDistrito`, `provincia_id` }
- DistritoRead: { `id`, `nombreDistrito`, `provincia_id` }

### Colegios

- Base: `/api/colegios`
- `GET /api/colegios/` → lista ColegioRead
- `POST /api/colegios/` → ColegioCreate (requiere `distrito_id` válido)

Esquemas:

- ColegioCreate: { `nombreColegio`, `distrito_id` }
- ColegioRead: { `id`, `nombreColegio`, `distrito_id` }

---

## Preinscripciones y Prepagos

### Preinscripciones

- Base: `/api/preinscripciones`
- `GET /api/preinscripciones/` → lista PreInscripcionRead
- `POST /api/preinscripciones/` → PreInscripcionCreate (valida FKs)

Esquemas (PreInscripcion):

- Create: { `nombreAlumno`, `aMaterno`, `aPaterno`, `sexo`, `telefonoEstudiante`, `telefonoApoderado`,
  `fechaNacimiento`, `email`, `anoCulminado`, `Direccion`, `nroDocumento`, `idColegio`, `idCiclo`, `idPrograma` }
- Read: los campos anteriores + `id`

### Prepagos

- Base: `/api/prepagos`
- `GET /api/prepagos/` → lista PrePagoRead
- `POST /api/prepagos/` → PrePagoCreate (requiere `idInscripcion` válido)

Esquemas (PrePago):

- Create: { `nroVoucher`, `medioPago`, `monto`, `fecha`, `idInscripcion`, `foto`, `TipoPago` }
- Read: los campos anteriores + `id`

---

## Bandeja (Operaciones operativas)

- Base: `/api/bandeja`

1. `GET /api/bandeja/counts` → `{ preinscripcionesPendientes, pagosPendientes }`
2. `GET /api/bandeja/preinscripciones` → lista pendientes (con prepagos)
3. `POST /api/bandeja/preinscripciones/{pre_id}/aprobar` → 201 InscripcionRead
4. `POST /api/bandeja/preinscripciones/{pre_id}/rechazar` → { status: "ok" }
5. `GET /api/bandeja/pagos` → lista pagos pendientes
6. `POST /api/bandeja/pagos/{pago_id}/aprobar` → aprueba pago
7. `POST /api/bandeja/pagos/{pago_id}/rechazar` → rechaza/elimina pago

---

## Ejemplos (PowerShell)

Login y usar token:

```powershell
curl -X POST "http://localhost:8000/api/auth/login" `
  -H "accept: application/json" `
  -H "Content-Type: application/x-www-form-urlencoded" `
  -d "username=admin&password=admin123"

$token = "<pega_aqui_el_token>"

curl -X GET "http://localhost:8000/api/users/" `
  -H "Authorization: Bearer $token" `
  -H "accept: application/json"
```

Crear ciclo y listar:

```powershell
curl -X POST "http://localhost:8000/api/ciclos/" `
  -H "accept: application/json" `
  -H "Content-Type: application/json" `
  -d '{
    "nombreCiclo": "2025-A",
    "fechaInicio": "2025-02-01",
    "fechaFin": "2025-07-15",
    "estado": true
  }'

curl -X GET "http://localhost:8000/api/ciclos/" -H "accept: application/json"
```

---

## Notas finales

- CORS: permitido según `core.config.Config` (CORS_ORIGINS, etc.). Ajusta `.env` para tu frontend.
- Paginación: listados principales (`programas`, `ciclos`, `grupos`, `clases`, `alumnos`, `inscripciones`, `pagos`) soportan `offset`, `limit`, `page` y opcional `q`. Respuesta uniforme: `Page[...]`.
- Errores: validaciones de FK → 400; inexistentes → 404; autenticación insuficiente 401/403.
- OpenAPI/Swagger: `http://localhost:8000/docs` o JSON en `/openapi.json`.
