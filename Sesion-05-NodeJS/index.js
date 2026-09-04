import { iniciarServidor, obtenerConfig, infoSistema } from './src/app.js';

const config = obtenerConfig(process.env);

console.log(`🚀 Iniciando ${config.nombreApp} en el puerto ${config.puerto}`);
console.log('🖥️  Sistema:', infoSistema());

iniciarServidor(config);

console.log('⏹️  Presiona Ctrl+C para detener.');
