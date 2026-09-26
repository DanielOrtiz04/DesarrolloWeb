import { randomUUID } from 'node:crypto';
import { ICursosRepository } from './ICursosRepository.js';

export class MockCursosRepository extends ICursosRepository {
  constructor(datosIniciales = []) {
    super();
    this.cursos = [...datosIniciales];
  }

  async listar() {
    return [...this.cursos].sort((a, b) => a.nombre.localeCompare(b.nombre));
  }

  async obtener(id) {
    return this.cursos.find((c) => c.id === id) ?? null;
  }

  async crear(datos) {
    if (this.cursos.some((c) => c.codigo === datos.codigo)) {
      throw new Error('El código del curso ya existe');
    }
    const curso = { id: randomUUID(), ...datos };
    this.cursos.push(curso);
    return curso;
  }

  async actualizar(id, cambios) {
    const i = this.cursos.findIndex((c) => c.id === id);
    if (i === -1) return null;
    this.cursos[i] = { ...this.cursos[i], ...cambios };
    return this.cursos[i];
  }

  async eliminar(id) {
    const antes = this.cursos.length;
    this.cursos = this.cursos.filter((c) => c.id !== id);
    return this.cursos.length < antes;
  }
}
