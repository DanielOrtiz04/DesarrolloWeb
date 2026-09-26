import { randomUUID } from 'node:crypto';
import { IUsuariosRepository } from './IUsuariosRepository.js';

export class MockUsuariosRepository extends IUsuariosRepository {
  constructor(datosIniciales = []) {
    super();
    this.usuarios = [...datosIniciales];
  }

  async buscarPorEmail(email) {
    return this.usuarios.find((u) => u.email === email) ?? null;
  }

  async crear(datos) {
    if (this.usuarios.some((u) => u.email === datos.email)) {
      throw new Error('El email ya está registrado');
    }
    const usuario = { id: randomUUID(), ...datos };
    this.usuarios.push(usuario);
    return usuario;
  }
}
