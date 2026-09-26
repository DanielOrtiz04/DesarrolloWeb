import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';

process.env.JWT_SECRET = 'secreto-de-prueba';
process.env.SESSION_SECRET = 'secreto-de-sesion-prueba';

const { crearApp } = await import('../src/app.js');
const { MockCursosRepository } = await import('../src/repositories/MockCursosRepository.js');
const { MockUsuariosRepository } = await import('../src/repositories/MockUsuariosRepository.js');

let servidor;
let base;

const json = (token) => ({
  'Content-Type': 'application/json',
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
});

before(async () => {
  const app = await crearApp({
    cursosRepo: new MockCursosRepository([]),
    usuariosRepo: new MockUsuariosRepository([]),
    usarSessionStorePostgres: false,
  });
  servidor = app.listen(0, '127.0.0.1');
  base = `http://127.0.0.1:${servidor.address().port}`;
});

after(() => servidor.close());

describe('GET /cursos (Ejercicio 2)', () => {
  it('responde 200 con arreglo vacío al inicio', async () => {
    const res = await fetch(`${base}/cursos`);
    assert.equal(res.status, 200);
    assert.deepEqual(await res.json(), []);
  });
});

describe('POST /cursos protegido con authJWT (Ejercicio 3)', () => {
  it('sin token -> 401', async () => {
    const res = await fetch(`${base}/cursos`, {
      method: 'POST',
      headers: json(),
      body: JSON.stringify({ nombre: 'Redes', codigo: 'RED-101', creditos: 3 }),
    });
    assert.equal(res.status, 401);
  });

  it('con datos inválidos -> 400', async () => {
    await fetch(`${base}/auth/registro`, {
      method: 'POST', headers: json(),
      body: JSON.stringify({ email: 'docente@umg.edu.gt', password: 'demo1234' }),
    });
    const login = await fetch(`${base}/auth/login`, {
      method: 'POST', headers: json(),
      body: JSON.stringify({ email: 'docente@umg.edu.gt', password: 'demo1234' }),
    });
    const { token } = await login.json();

    const res = await fetch(`${base}/cursos`, {
      method: 'POST',
      headers: json(token),
      body: JSON.stringify({ nombre: '', codigo: '', creditos: 0 }),
    });
    assert.equal(res.status, 400);
  });

  it('login -> token -> crear curso responde 201 (Ejercicios 4 y 6)', async () => {
    const login = await fetch(`${base}/auth/login`, {
      method: 'POST', headers: json(),
      body: JSON.stringify({ email: 'docente@umg.edu.gt', password: 'demo1234' }),
    });
    assert.equal(login.status, 200);
    const { token } = await login.json();
    assert.ok(token, 'debe devolver un JWT');

    const res = await fetch(`${base}/cursos`, {
      method: 'POST',
      headers: json(token),
      body: JSON.stringify({ nombre: 'Bases de Datos II', codigo: 'BD-202', creditos: 4 }),
    });
    assert.equal(res.status, 201);
    const cursoCreado = await res.json();
    assert.equal(cursoCreado.codigo, 'BD-202');
  });
});

describe('POST /auth/registro y /auth/login (Ejercicio 4)', () => {
  it('rechaza login con contraseña incorrecta -> 401', async () => {
    const res = await fetch(`${base}/auth/login`, {
      method: 'POST', headers: json(),
      body: JSON.stringify({ email: 'docente@umg.edu.gt', password: 'incorrecta' }),
    });
    assert.equal(res.status, 401);
  });

  it('rechaza registro duplicado -> 409', async () => {
    const res = await fetch(`${base}/auth/registro`, {
      method: 'POST', headers: json(),
      body: JSON.stringify({ email: 'docente@umg.edu.gt', password: 'demo1234' }),
    });
    assert.equal(res.status, 409);
  });
});

describe('Sesión (Ejercicio 5 - se valida manualmente contra Postgres)', () => {
  it('el contador de sesión incrementa dentro del mismo proceso', async () => {
    const res1 = await fetch(`${base}/sesion/contador`);
    const cookie = res1.headers.get('set-cookie');
    const body1 = await res1.json();
    assert.equal(body1.contador, 1);

    const res2 = await fetch(`${base}/sesion/contador`, {
      headers: { Cookie: cookie },
    });
    const body2 = await res2.json();
    assert.equal(body2.contador, 2);
  });
});
