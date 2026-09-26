import pg from 'pg';
import { config } from '../config.js';

// Un Pool reutiliza conexiones (no abras una por petición)
export const pool = new pg.Pool({ connectionString: config.db });

// Prueba de conexión al arrancar
export async function probarConexion() {
  const { rows } = await pool.query('select now() as ahora');
  console.log('✅ Postgres conectado:', rows[0].ahora);
}
