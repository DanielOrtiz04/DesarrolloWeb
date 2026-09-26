import express from 'express';
import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import { config } from './config.js';
import { pool } from './db/pool.js';
import { cursosRoutes } from './routes/cursos.routes.js';
import { authRoutes } from './routes/auth.routes.js';
import { manejadorErrores } from './middlewares/errores.js';

export async function crearApp({ cursosRepo, usuariosRepo, usarSessionStorePostgres = true }) {
  const app = express();
  app.use(express.json());

  const sessionOptions = {
    secret: config.sessionSecret ?? 'secreto-de-prueba',
    resave: false,
    saveUninitialized: false,
    cookie: { httpOnly: true, sameSite: 'lax' },
  };

  if (usarSessionStorePostgres) {
    const PgStore = connectPgSimple(session);
    sessionOptions.store = new PgStore({
      pool,
      tableName: 'sesiones',
      createTableIfMissing: true,
    });
  }

  app.use(session(sessionOptions));

  app.use('/auth', authRoutes(usuariosRepo));
  app.use('/cursos', cursosRoutes(cursosRepo));

  app.get('/sesion/contador', (req, res) => {
    req.session.contador = (req.session.contador ?? 0) + 1;
    res.json({ contador: req.session.contador });
  });

  app.use(manejadorErrores);
  return app;
}
