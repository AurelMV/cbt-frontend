# CBT Backend API — Documentación de Endpoints

Esta guía resume todos los endpoints disponibles del backend, sus rutas, autenticación, parámetros y esquemas para implementar el frontend.

Base URL: `http://localhost:8000`
Prefijo global: `+/api` (todas las rutas comienzan con `/api/...`)
Formato: JSON por defecto. En login se usa form-data (OAuth2 Password).

Nota sobre trailing slash: varias rutas base están definidas con `/` final (por ejemplo `/api/ciclos/`). Si llamas sin `/` final, el servidor hará un 307 hacia la versión con `/`.

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
     - `id`: int
     - `username`: string
     - `email`: Email
     - `roles`: [{ `name`: string }]

2. `POST /api/auth/login`
   - Body (form-data):
     - `username`: string (puede ser email o username)
     - `password`: string
   - Respuesta 200 (Token):
     - `access_token`: string (JWT)
     - `token_type`: "bearer"

Scopes/roles:

- Algunos endpoints requieren roles (scopes). Actualmente:
  - `GET /api/users/me`: scope `user`
  - `GET /api/users/`: scope `admin`
- El resto de routers en esta versión no exigen autenticación.

---

## Users

- Base: `/api/users`

1. `GET /api/users/me` (protegido: scope user)

   - Respuesta 200 (UserRead)

2. `GET /api/users/` (protegido: scope admin)
   - Respuesta 200: lista de UserRead

---

## Programas

- Base: `/api/programas`

1. `GET /api/programas/`

   - Respuesta: 200, lista de ProgramaRead

2. `POST /api/programas/`

   - Body (ProgramaCreate): { `nombrePrograma`: string }
   - Respuesta: 201, ProgramaRead

3. `PUT /api/programas/{programa_id}`
   - Body (ProgramaUpdate): { `nombrePrograma`: string }
   - Respuestas: 200 (ok) o 404 si no existe

Esquemas:

- ProgramaCreate/Update: { `nombrePrograma`: string }
- ProgramaRead: { `id`: int, `nombrePrograma`: string }

---

## Ciclos

- Base: `/api/ciclos`

1. `GET /api/ciclos/`

   - Respuesta: 200, lista de CicloRead

2. `POST /api/ciclos/`

   - Body (CicloCreate): { `nombreCiclo`: string, `fechaInicio`: date, `fechaFin`: date, `estado`: bool=true }
   - Respuesta: 201, CicloRead

3. `PUT /api/ciclos/{ciclo_id}`
   - Body (CicloUpdate): { `nombreCiclo`: string, `fechaInicio`: date, `fechaFin`: date, `estado`: bool }
   - Respuestas: 200 (ok) o 404

Esquemas:

- CicloRead: { `id`: int, `nombreCiclo`: string, `fechaInicio`: date, `fechaFin`: date, `estado`: bool }

---

## Grupos

- Base: `/api/grupos`

1. `GET /api/grupos/`

   - Respuesta: 200, lista de GrupoRead

2. `POST /api/grupos/`

   - Body (GrupoCreate): { `nombreGrupo`: string, `aforo`: int, `estado`: bool=true, `ciclo_id`: int }
   - Respuesta: 201, GrupoRead

3. `PUT /api/grupos/{grupo_id}`
   - Body (GrupoUpdate): { `nombreGrupo`: string, `aforo`: int, `estado`: bool, `ciclo_id`: int }
   - Validaciones: `ciclo_id` debe existir
   - Respuestas: 200 (ok), 400 (FK), 404 (no encontrado)

Esquemas:

- GrupoRead: { `id`: int, `nombreGrupo`: string, `aforo`: int, `estado`: bool, `ciclo_id`: int }

---

## Clases

- Base: `/api/clases`

1. `GET /api/clases/`

   - Respuesta: 200, lista de ClaseRead

2. `POST /api/clases/`

   - Body (ClaseCreate): { `codigoClase`: string, `grupo_id`: int }
   - Respuesta: 201, ClaseRead

3. `PUT /api/clases/{clase_id}`
   - Body (ClaseUpdate): { `codigoClase`: string, `grupo_id`: int }
   - Validaciones: `grupo_id` debe existir
   - Respuestas: 200 (ok), 400 (FK), 404 (no encontrado)

Esquemas:

- ClaseRead: { `id`: int, `codigoClase`: string, `grupo_id`: int }

---

## Ubicación

### Departamentos

- Base: `/api/departamentos`
- `GET /api/departamentos/` → lista DepartamentoRead
- `POST /api/departamentos/` → crea con DepartamentoCreate

Esquemas:

- DepartamentoCreate: { `nombreDepartamento`: string }
- DepartamentoRead: { `id`: int, `nombreDepartamento`: string }

### Provincias

- Base: `/api/provincias`
- `GET /api/provincias/` → lista ProvinciaRead
- `POST /api/provincias/` → crea con ProvinciaCreate (requiere `departamento_id` válido)

Esquemas:

- ProvinciaCreate: { `nombreProvincia`: string, `departamento_id`: int }
- ProvinciaRead: { `id`: int, `nombreProvincia`: string, `departamento_id`: int }

### Distritos

- Base: `/api/distritos`
- `GET /api/distritos/` → lista DistritoRead
- `POST /api/distritos/` → crea con DistritoCreate (requiere `provincia_id` válido)

Esquemas:

- DistritoCreate: { `nombreDistrito`: string, `provincia_id`: int }
- DistritoRead: { `id`: int, `nombreDistrito`: string, `provincia_id`: int }

### Colegios

- Base: `/api/colegios`
- `GET /api/colegios/` → lista ColegioRead
- `POST /api/colegios/` → crea con ColegioCreate (requiere `distrito_id` válido)

Esquemas:

- ColegioCreate: { `nombreColegio`: string, `distrito_id`: int }
- ColegioRead: { `id`: int, `nombreColegio`: string, `distrito_id`: int }

---

## Preinscripciones y Prepagos

### Preinscripciones

- Base: `/api/preinscripciones`
- `GET /api/preinscripciones/` → lista PreInscripcionRead
- `POST /api/preinscripciones/` → crea con PreInscripcionCreate
  - Validaciones: `idColegio`, `idCiclo`, `idPrograma` deben existir

Esquemas (PreInscripcion):

- Create: {
  `nombreAlumno`, `aMaterno`, `aPaterno`, `sexo`, `telefonoEstudiante`, `telefonoApoderado`,
  `fechaNacimiento` (date), `email` (Email), `anoCulminado` (int), `Direccion`, `nroDocumento`,
  `idColegio` (int), `idCiclo` (int), `idPrograma` (int)
  }
- Read: los campos anteriores + `id`

### Prepagos

- Base: `/api/prepagos`
- `GET /api/prepagos/` → lista PrePagoRead
- `POST /api/prepagos/` → crea con PrePagoCreate (requiere `idInscripcion` válido)

Esquemas (PrePago):

- Create: { `nroVoucher`: string, `medioPago`: string, `monto`: number, `fecha`: date, `idInscripcion`: int, `foto`: string|null, `TipoPago`: string }
- Read: los campos anteriores + `id`

---

## Alumnos

- Base: `/api/alumnos`
- `GET /api/alumnos/` → lista AlumnoRead
- `POST /api/alumnos/` → crea con AlumnoCreate (requiere `idColegio` válido)

Esquemas (Alumno):

- Base/Create: {
  `nombreAlumno`, `aMaterno`, `aPaterno`, `sexo`, `telefonoEstudiante`, `telefonoApoderado`,
  `fechaNacimiento` (date), `email` (Email), `anoCulminado` (int), `Direccion`, `nroDocumento`,
  `idColegio` (int)
  }
- Read: los campos anteriores + `id`

---

## Inscripciones

- Base: `/api/inscripciones`

1. `GET /api/inscripciones/` → lista InscripcionRead
2. `POST /api/inscripciones/` → crea con InscripcionCreate
   - Validaciones: `idAlumno`, `idPrograma`, `idCiclo`, `idClase` deben existir
3. `GET /api/inscripciones/buscar?dni={dni}&idCiclo={id}` → busca por DNI y ciclo
   - Respuestas: 200 con InscripcionLookupRead o 404

Esquemas (Inscripción):

- Base/Create: {
  `turno`, `fecha` (date), `Estado` (bool=true), `idAlumno` (int), `idPrograma` (int),
  `idCiclo` (int), `idClase` (int), `Codigo` (string), `EstadoPago` (string), `TipoPago` (string)
  }
- Read: los campos anteriores + `id`
- LookupRead: { `idInscripcion`, `idAlumno`, `idCiclo`, `nombreAlumno`, `aPaterno`, `aMaterno`, `Codigo`? }

---

## Pagos

- Base: `/api/pagos`
- `GET /api/pagos/` → lista PagoRead (pagos registrados)
- `POST /api/pagos/` → crea con PagoCreate (requiere `idInscripcion` válido)

Esquemas (Pago):

- Base/Create: { `nroVoucher`, `medioPago`, `monto` (number), `fecha` (date), `idInscripcion` (int), `foto` (string|null), `Estado` (bool=false) }
- Read: los campos anteriores + `id`

---

## Bandeja (Operaciones operativas)

- Base: `/api/bandeja`

1. `GET /api/bandeja/counts`

   - Devuelve conteos: `{ preinscripcionesPendientes, pagosPendientes }`

2. `GET /api/bandeja/preinscripciones`

   - Lista preinscripciones en estado `pendiente` junto a sus prepagos (si hay)

3. `POST /api/bandeja/preinscripciones/{pre_id}/aprobar`

   - Body: { `idGrupo`: int, `idClase`: int }
   - Efecto: crea/encadena Alumno, Inscripción y marca prepagos/preinscripción como aceptados
   - Respuesta: 201, InscripcionRead

4. `POST /api/bandeja/preinscripciones/{pre_id}/rechazar`

   - Efecto: marca preinscripción y prepagos como rechazados
   - Respuesta: { status: "ok" }

5. `GET /api/bandeja/pagos`

   - Lista pagos reales en estado pendiente (para revisión)

6. `POST /api/bandeja/pagos/{pago_id}/aprobar`

   - Marca el pago como aprobado

7. `POST /api/bandeja/pagos/{pago_id}/rechazar`
   - Rechaza/elimina pago

---

## Ejemplos (PowerShell)

Login y usar token:

```powershell
# Login (form-data)
curl -X POST "http://localhost:8000/api/auth/login" `
  -H "accept: application/json" `
  -H "Content-Type: application/x-www-form-urlencoded" `
  -d "username=admin&password=admin123"

# Supón que obtienes $token
$token = "<pega_aqui_el_token>"

# Endpoint protegido (solo admin)
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
- Paginación: los listados actuales devuelven todo. Si necesitas paginación, podemos añadir `offset`/`limit` a cada recurso.
- Errores: las validaciones de FK devuelven 400; recursos inexistentes devuelven 404; autenticación insuficiente 401/403 según el caso.
- OpenAPI/Swagger: `http://localhost:8000/docs` o JSON en `/openapi.json`.
