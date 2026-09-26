import { IUsuariosRepository } from './IUsuariosRepository.js';

export class SequelizeUsuariosRepository extends IUsuariosRepository {
  constructor(modelo) {
    super();
    this.modelo = modelo;
  }

  async buscarPorEmail(email) {
    return this.modelo.findOne({ where: { email } });
  }

  async crear(datos) {
    return this.modelo.create(datos);
  }
}
