import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { MockCursosRepository } from '../src/repositories/MockCursosRepository.js';
import { SequelizeCursosRepository } from '../src/repositories/SequelizeCursosRepository.js';

const curso = { nombre: 'Bases de Datos II', codigo: 'BD-202', creditos: 4 };

describe('MockCursosRepository', () => {
  it('crea y lista cursos', async () => {
    const repo = new MockCursosRepository([]);
    const creado = await repo.crear(curso);
    assert.ok(creado.id, 'debe generar un id');
    assert.equal((await repo.listar()).length, 1);
  });

  it('rechaza un código de curso duplicado', async () => {
    const repo = new MockCursosRepository([]);
    await repo.crear(curso);
    await assert.rejects(() => repo.crear(curso), /código/i);
  });

  it('eliminar() devuelve true si existía', async () => {
    const repo = new MockCursosRepository([{ id: 'c-1', ...curso }]);
    assert.equal(await repo.eliminar('c-1'), true);
  });

  it('actualizar() devuelve null si no existe', async () => {
    const repo = new MockCursosRepository([]);
    assert.equal(await repo.actualizar('no-existe', { creditos: 5 }), null);
  });
});

// Repositorio Sequelize probado con un modelo falso (sin base de datos real)
class ModeloFalso {
  constructor(filas = []) { this.filas = filas; }
  async findAll() { return this.filas; }
  async findByPk(id) { return this.filas.find((f) => f.id === id) ?? null; }
  async create(datos) { const f = { id: 'c-1', ...datos }; this.filas.push(f); return f; }
  async update(cambios, { where }) {
    const i = this.filas.findIndex((f) => f.id === where.id);
    if (i === -1) return [0];
    this.filas[i] = { ...this.filas[i], ...cambios };
    return [1];
  }
  async destroy({ where }) {
    const antes = this.filas.length;
    this.filas = this.filas.filter((f) => f.id !== where.id);
    return antes - this.filas.length;
  }
}

describe('SequelizeCursosRepository (modelo falso)', () => {
  it('listar() usa findAll', async () => {
    const repo = new SequelizeCursosRepository(new ModeloFalso([{ id: 'c-1', nombre: 'Redes' }]));
    assert.equal((await repo.listar()).length, 1);
  });

  it('actualizar() devuelve null si no existe', async () => {
    const repo = new SequelizeCursosRepository(new ModeloFalso([]));
    assert.equal(await repo.actualizar('no-existe', { creditos: 3 }), null);
  });

  it('crear() delega en el modelo', async () => {
    const repo = new SequelizeCursosRepository(new ModeloFalso([]));
    const creado = await repo.crear(curso);
    assert.equal(creado.codigo, 'BD-202');
  });
});
