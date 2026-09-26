// src/routes/cursos.routes.js
import { Router } from 'express';
import { asyncHandler } from '../middlewares/errores.js';
import { authJWT } from '../middlewares/auth.js';
import { validarCurso, revisarErrores } from '../validators/cursoValidator.js';
import { registrarAccion } from '../services/logService.js';

export function cursosRoutes(repo) {
  const router = Router();

  router.get('/', asyncHandler(async (req, res) => {
    res.json(await repo.listar());
  }));

  router.get('/:id', asyncHandler(async (req, res) => {
    const curso = await repo.obtener(req.params.id);
    if (!curso) return res.status(404).json({ error: 'No encontrado' });
    res.json(curso);
  }));

  router.post(
    '/',
    authJWT,
    validarCurso,
    revisarErrores,
    asyncHandler(async (req, res) => {
      const curso = await repo.crear(req.body);

      registrarAccion(`Curso creado: ${curso.codigo} - ${curso.nombre} (por ${req.usuario?.sub ?? 'desconocido'})`)
        .catch((e) => console.error('No se pudo registrar el log:', e.message));

      res.status(201).json(curso);
    }),
  );

  return router;
}
