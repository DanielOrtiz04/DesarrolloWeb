import { createReadStream, createWriteStream } from 'node:fs';
import { pipeline } from 'node:stream/promises';
import { Readable } from 'node:stream';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

export const __filename = fileURLToPath(import.meta.url);
export const __dirname = dirname(__filename);

/**
 * @returns {string}
 */
export function generarId() {
    return `r-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
}
/**
 * @param {string} origen  
 * @param {string} destino 
 * @param {string} texto  
 * @returns {Promise<number>} 
 */
export async function filtrarLogs(origen, destino, texto) {
    throw new Error('Not implemented: filtrarLogs');
}

/**
 * @param {string} ruta
 * @returns {Promise<string[]>}
 */
export async function leerLineas(ruta) {
    throw new Error('Not implemented: leerLineas');
}

/**
 * @param {string} rutaRelativa
 * @returns {string}
 */
export function rutaAbsoluta(rutaRelativa) {
    return join(__dirname, rutaRelativa);
}

/**
 * @param {string} contenido
 * @returns {Record<string, string>}
 */
export function parsearEnv(contenido) {
    const resultado = {};
    const lineas = contenido.split('\n');

    for (const linea of lineas) {
        const limpia = linea.trim();
        if (limpia === '' || limpia.startsWith('#')) continue;

        const igualIndex = limpia.indexOf('=');
        if (igualIndex === -1) continue;

        const clave = limpia.slice(0, igualIndex).trim();
        const valor = limpia.slice(igualIndex + 1).trim();
        resultado[clave] = valor;
    }

    return resultado;
}