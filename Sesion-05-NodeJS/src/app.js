import http from 'node:http';
import { EventEmitter } from 'node:events';
import os from 'node:os';
import path from 'node:path';
import fs from 'node:fs/promises';


/**
 * @returns {string}
 */
export function generarId() {
    return `m-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
}

/**
 * @param {import('node:http').IncomingMessage} req
 * @returns {Promise<string>}
 */
function leerBody(req) {
    return new Promise((resolve, reject) => {
        let data = '';
        req.on('data', (chunk) => (data += chunk));
        req.on('end', () => resolve(data));
        req.on('error', reject);
    });
}

/**

 * @param {string[]} argv 
 * @returns {{ nombre: string, puerto: number }}
 */
export function parsearArgumentos(argv) {
    const args = argv.slice(2);
    let nombre = 'invitado';
    let puerto = 3000;
    
    for (let i = 0; i < args.length; i++) {
        if (args[i] === '--nombre' && args[i + 1] ) {
            nombre = args[i + 1];
        } 
        else if (args[i] === '--puerto' && args[i + 1] ) {
            puerto = parseInt(args[i + 1]);
        }
}

    return { nombre, puerto };
}

/**
 * @param {NodeJS.ProcessEnv} env
 * @returns {{ puerto: number, nombreApp: string, archivoDatos: string }}
 */
export function obtenerConfig(env) {
    return {
        puerto: env.PORT ? parseInt(env.PORT) : 3000,
        nombreApp: env.NOMBRE_APP || 'mensajes-api',
        archivoDatos: env.ARCHIVO_DATOS || 'data/mensajes.json',
    };
}

/**
 * @returns {{ plataforma: string, nucleos: number, memoriaLibreMB: number, hostname: string }}
 */
export function infoSistema() {
    return {
        plataforma: os.platform(),
        nucleos: os.cpus().length,
        memoriaLibreMB: Math.round(os.freemem() / 1024 / 1024),
        hostname: os.hostname(),
    };
}

/**

 * @returns {{ registrar: (mensaje: string) => void, onRegistro: (fn: (linea: string) => void) => void }}
 */
export function crearLogger() {
    const emitter = new EventEmitter();

    return {
        registrar(mensaje) {
            const linea = `[${new Date().toISOString()}] ${mensaje}`;
            emitter.emit('registro', linea);
        },
        onRegistro(fn) {
            emitter.on('registro', fn);
        },
    };
}

/**
 * @param {string} archivoDatos 
 * @returns {Promise<Array<{id: string, texto: string, fecha: string}>>}
 */
export async function leerMensajes(archivoDatos) {
    try {
        const contenido = await fs.readFile(archivoDatos, 'utf-8');
        const datos = JSON.parse(contenido);
        return Array.isArray(datos) ? datos : [];
    } catch {
        return [];
    }
}

/**
 * @param {string} archivoDatos 
 * @param {string} texto
 * @returns {Promise<{id: string, texto: string, fecha: string} | null>}
 */
export async function agregarMensaje(archivoDatos, texto) {
    const textoLimpio = texto.trim();
    if (textoLimpio === '') return null;

    const mensajes = await leerMensajes(archivoDatos);

    const nuevoMensaje = {
        id: generarId(),
        texto: textoLimpio,
        fecha: new Date().toISOString(),
    };

    mensajes.push(nuevoMensaje);

    await fs.mkdir(path.dirname(archivoDatos), { recursive: true });
    await fs.writeFile(archivoDatos, JSON.stringify(mensajes, null, 2), 'utf-8');

    return nuevoMensaje;
}

/**

 * @param {{ archivoDatos?: string, nombreApp?: string, logger?: ReturnType<typeof crearLogger> }} [config]
 * @returns {import('node:http').Server}
 */
export function crearServidor(config = {}) {
    throw new Error('Not implemented: crearServidor');
}

/**
 
 * @param {{ puerto?: number, archivoDatos?: string, nombreApp?: string, logger?: ReturnType<typeof crearLogger> }} [config]
 * @returns {import('node:http').Server}
 */
export function iniciarServidor(config = {}) {
    throw new Error('Not implemented: iniciarServidor');
}

