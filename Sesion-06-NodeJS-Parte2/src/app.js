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
    let contador = 0;

    const origenStream = createReadStream(origen, { encoding: 'utf-8' });
    const destinoStream = createWriteStream(destino, { encoding: 'utf-8' });

    let sobrante = '';

    const transformador = new Readable.from(
        (async function* () {
            for await (const chunk of origenStream) {
                sobrante += chunk;
                const lineas = sobrante.split('\n');
                sobrante = lineas.pop();

                for (const linea of lineas) {
                    if (linea.includes(texto)) {
                        contador++;
                        yield linea + '\n';
                    }
                }
            }
            if (sobrante && sobrante.includes(texto)) {
                contador++;
                yield sobrante + '\n';
            }
        })()
    );

    await pipeline(transformador, destinoStream);

    return contador;
}

/**
 * @param {string} ruta
 * @returns {Promise<string[]>}
 */
export async function leerLineas(ruta) {
    return new Promise((resolve, reject) => {
        const stream = createReadStream(ruta, { encoding: 'utf-8' });
        let data = '';

        stream.on('data', (chunk) => {
            data += chunk;
        });

        stream.on('end', () => {
            const lineas = data
                .split('\n')
                .map((l) => l.trim())
                .filter((l) => l.length > 0);
            resolve(lineas);
        });

        stream.on('error', reject);
    });
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