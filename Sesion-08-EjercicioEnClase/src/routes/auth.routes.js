import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { asyncHandler } from '../middlewares/errores.js';
import { hashearPassword, verificarPassword } from '../auth/passwords.js';
import { firmarToken } from '../auth/jwt.js';

const validarCredenciales = [
  body('email').trim().isEmail().withMessage('El email no es válido'),
  body('password').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
];

function revisarErrores(req, res, next) {
  const errores = validationResult(req);
  if (!errores.isEmpty()) return res.status(400).json({ errores: errores.array() });
  next();
}

export function authRoutes(usuariosRepo) {
  const router = Router();

    router.post(
    '/registro',
    validarCredenciales,
    revisarErrores,
    asyncHandler(async (req, res) => {
      const { email, password } = req.body;
      const yaExiste = await usuariosRepo.buscarPorEmail(email);
      if (yaExiste) return res.status(409).json({ error: 'El email ya está registrado' });

      const hash = await hashearPassword(password);
      const usuario = await usuariosRepo.crear({ email, password: hash });

      res.status(201).json({ id: usuario.id, email: usuario.email });
    }),
  );

  router.post(
    '/login',
    validarCredenciales,
    revisarErrores,
    asyncHandler(async (req, res) => {
      const { email, password } = req.body;
      const usuario = await usuariosRepo.buscarPorEmail(email);
      if (!usuario) return res.status(401).json({ error: 'Credenciales inválidas' });

      const coincide = await verificarPassword(password, usuario.password);
      if (!coincide) return res.status(401).json({ error: 'Credenciales inválidas' });

      const token = firmarToken({ sub: usuario.id, email: usuario.email }, '1h');
      res.json({ token });
    }),
  );

  return router;
}
