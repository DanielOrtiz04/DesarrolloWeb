// src/auth/passwords.js
import bcrypt from 'bcrypt';

const RONDAS_SALT = 10;

// Al registrar: nunca guardar la contraseña en texto plano
export async function hashearPassword(passwordPlano) {
  return bcrypt.hash(passwordPlano, RONDAS_SALT);
}

// Al iniciar sesión: se hashea lo recibido y se compara contra el hash guardado
export async function verificarPassword(passwordPlano, hash) {
  return bcrypt.compare(passwordPlano, hash);
}
