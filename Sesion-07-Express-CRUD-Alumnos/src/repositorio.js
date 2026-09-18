/**
 * @typedef {{ id: string, nombre: string, apellido: string, email: string, edad: number }} Alumno
 * @type {Alumno[]}
 */
export const datosSemilla = [
    { id: 'a-1', nombre: 'Ana',    apellido: 'López',   email: 'ana.lopez@umg.edu.gt',    edad: 20 },
    { id: 'a-2', nombre: 'Luis',   apellido: 'Pérez',   email: 'luis.perez@umg.edu.gt',   edad: 22 },
    { id: 'a-3', nombre: 'Marta',  apellido: 'García',  email: 'marta.garcia@umg.edu.gt', edad: 21 },
];

export class RepositorioAlumnos {
    /**
     * @param {Alumno[]} alumnosIniciales
     */
    constructor(alumnosIniciales = []) {
        this.alumnos = alumnosIniciales.map((alumno) => ({ ...alumno }));
        this.siguienteId = this.alumnos.length + 1;
    }

    /**
     * @returns {Alumno[]}
     */
    listar() {
        return [...this.alumnos];
    }

    /**
     * @param {string} id
     * @returns {Alumno | undefined}
     */
    obtener(id) {
        return this.alumnos.find((a) => a.id === id);
    }

    /**
     * @param {Omit<Alumno, 'id'>} datos
     * @returns {Alumno}
     */
    crear(datos) {
        const nuevo = { id: `a-${this.siguienteId++}`, ...datos };
        this.alumnos.push(nuevo);
        return nuevo;
    }

    /**
     * @param {string} id
     * @param {Partial<Omit<Alumno, 'id'>>} datose
     * @returns {Alumno | undefined}
     */
    actualizar(id, datos) {
        const alumno = this.obtener(id);
        if (!alumno) return undefined;
        Object.assign(alumno, datos);
        return alumno;
    }

    /**
     * @param {string} id
     * @returns {boolean} 
     */
   eliminar(id) {
        const indice = this.alumnos.findIndex((a) => a.id === id);
        if (indice === -1) return false;
        this.alumnos.splice(indice, 1);
        return true;
    }
}
