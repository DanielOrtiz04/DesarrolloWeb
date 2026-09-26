// src/server.js
import 'dotenv/config';
import { config } from './config.js';
import { conectar } from './db/sequelize.js';
import { probarConexion } from './db/pool.js';
import { Curso } from './models/Curso.js';
import { Usuario } from './models/Usuario.js';
import { SequelizeCursosRepository } from './repositories/SequelizeCursosRepository.js';
import { SequelizeUsuariosRepository } from './repositories/SequelizeUsuariosRepository.js';
import { crearApp } from './app.js';
import { sequelize } from './db/sequelize.js';

process.on('unhandledRejection', (error) => {
  console.error('Promesa rechazada sin manejar:', error);
});

function validarVariablesObligatorias() {
  const faltantes = [];
  if (!config.db) faltantes.push('DATABASE_URL');
  if (!config.sessionSecret) faltantes.push('SESSION_SECRET');
  if (!config.jwtSecret) faltantes.push('JWT_SECRET');
  if (faltantes.length) {
    throw new Error(`Faltan variables de entorno: ${faltantes.join(', ')}. Revisa tu archivo .env`);
  }
}

async function main() {
  validarVariablesObligatorias();
  await conectar();
  await probarConexion();

  await sequelize.sync({ alter: true });

  const app = await crearApp({
    cursosRepo: new SequelizeCursosRepository(Curso),
    usuariosRepo: new SequelizeUsuariosRepository(Usuario),
    usarSessionStorePostgres: true,
  });

  app.listen(config.puerto, () => {
    console.log(`🚀 Servidor escuchando en http://localhost:${config.puerto}`);
  });
}

main().catch((err) => {
  console.error('Error al iniciar el servidor:', err);
  process.exit(1);
});
