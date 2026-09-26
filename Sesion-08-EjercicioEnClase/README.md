# Ejercicios en clase — Sesión 7 (Express + PostgreSQL)

Resuelve los 6 ejercicios siguiendo el mismo patrón de la sesión:
**Rutas → Validación (express-validator) → Repositorio (contrato) → Sequelize → PostgreSQL**.

## Mapeo ejercicio → archivo

| # | Ejercicio | Dónde está |
|---|-----------|-----------|
| 1 | Modelo `Curso` (nombre, código único, créditos) + repositorio Sequelize | `src/models/Curso.js`, `src/repositories/ICursosRepository.js`, `src/repositories/SequelizeCursosRepository.js` |
| 2 | `GET /cursos` y `POST /cursos` con `express-validator` | `src/routes/cursos.routes.js`, `src/validators/cursoValidator.js` |
| 3 | `POST /cursos` protegido con `authJWT` | `src/middlewares/auth.js` (reutilizado en `cursos.routes.js`) |
| 4 | Registro con bcrypt + login devolviendo JWT | `src/auth/passwords.js`, `src/auth/jwt.js`, `src/routes/auth.routes.js`, `src/models/Usuario.js` |
| 5 | `MemoryStore` → store en PostgreSQL, sesión sobrevive al reinicio | `src/app.js` (usa `connect-pg-simple`), endpoint de prueba `GET /sesion/contador` |
| 6 | Log fire-and-forget con manejo de error al crear un curso | `src/services/logService.js`, usado en `cursos.routes.js` |

## Instalar y correr

```bash
npm install
cp .env.example .env      # y completa tus credenciales de Postgres
npm start                 # levanta el servidor en http://localhost:3000
```

Requiere una instancia de PostgreSQL corriendo (ver comando `docker run` de la presentación).
Al arrancar, `sequelize.sync({ alter: true })` crea las tablas `cursos` y `usuarios`
(solo para desarrollo; en producción usarías migraciones, como explica la sesión).

## Correr las pruebas (no necesitan Postgres)

```bash
npm test
```

Las pruebas usan los repositorios **Mock** (en memoria) y un **modelo falso** de Sequelize,
igual que en la presentación, así que corren en segundos sin base de datos.

## Probar manualmente con `curl`

```bash
# 1) Registrar un usuario
curl -X POST http://localhost:3000/auth/registro \
  -H "Content-Type: application/json" \
  -d '{"email":"docente@umg.edu.gt","password":"demo1234"}'

# 2) Iniciar sesión y guardar el token
TOKEN=$(curl -s -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"docente@umg.edu.gt","password":"demo1234"}' | jq -r .token)

# 3) Crear un curso (protegido con authJWT)
curl -X POST http://localhost:3000/cursos \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"nombre":"Bases de Datos II","codigo":"BD-202","creditos":4}'

# 4) Listar cursos (sin protección)
curl http://localhost:3000/cursos
```

## Verificar el Ejercicio 5 (sesión sobrevive al reinicio)

1. Con el servidor corriendo, pide varias veces `GET /sesion/contador` **guardando la cookie**
   (por ejemplo con `curl -c cookies.txt -b cookies.txt http://localhost:3000/sesion/contador`).
   El contador debe subir en cada llamada.
2. Detén el servidor (`Ctrl+C`) y vuelve a levantarlo (`npm start`).
3. Repite la petición **con la misma cookie**: el contador debe seguir subiendo desde donde
   se quedó (no vuelve a 1), porque la sesión está en la tabla `sesiones` de Postgres,
   no en memoria.

## Notas de seguridad aplicadas

- Contraseñas con `bcrypt` (10 rondas), nunca se devuelve el hash en las respuestas.
- `codigo` del curso es `unique` en el modelo → `SequelizeUniqueConstraintError` se traduce
  a `409` en `manejadorErrores`.
- `authJWT` exige `Authorization: Bearer <token>`; sin él o con token inválido responde `401`.
- El log fire-and-forget nunca bloquea la respuesta y **siempre** captura su error con `.catch`.
