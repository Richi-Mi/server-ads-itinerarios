import Elysia, { t } from "elysia"; 
import cors from "@elysiajs/cors";
import { staticPlugin } from "@elysiajs/static";

import { PostgresDataSource } from "./data/PostgresDataSource";

import { userRoutes } from "./presentation/usuario";
import { lugarRoutes } from "./presentation/lugares";
import { actividadRoutes } from "./presentation/actividad";
import { itinerarioRoutes } from "./presentation/itinerario";

import { authRoutes } from "./presentation/auth";
import { CustomError } from "./domain/CustomError";
import { FileDataSource } from "./data/FileDataSource";

import { publicacionRoutes } from "./presentation/publicacion";

const app = new Elysia()
  .decorate('pgdb', PostgresDataSource)
  .onStart(async ({ decorator }) => { 
    // * Cuando el servidor se empieze: Intenta realizar la conexión e inicialización de la DB.
    try {
      console.log('Base de datos conectada');
      await decorator.pgdb.initialize();
    }
    catch (error) {
      console.error('Error al conectar con la base de datos:', error);
      process.exit(1);
    }
  })
  .onStop(async ({ decorator }) => { 
    // * Cuando el servidor se detenga: Destruir la conexión a la base de datos.
    await decorator.pgdb.destroy();
  })
  .error({ 'custom': CustomError })
  .onError(({ code, error, status }) => { 
    // * Control de errores.
    if (code === 'custom') {
      const customError = error as CustomError;
      return status( customError.statusCode, customError.toResponse());
    }
    if (code === 'VALIDATION')
      return error.detail(error.message)

    return status(500, { message: "Internal Server Error" });
  })
  .use(cors())
  .use(staticPlugin())
  .use(authRoutes)
  .use(userRoutes)
  .use(lugarRoutes)
  .use(itinerarioRoutes)
  .use(actividadRoutes)
  .get('/fotos/:file', async ({ params: { file }, set }) => {
    // * Ruta para servir imagenes desde el sistema de archivos
    const fileDataSource = FileDataSource.getInstance();
    const { mimeType, buffer } = await fileDataSource.getFileFromSource(`${file}`);

    if (!buffer || buffer.length === 0) 
      throw new CustomError("Archivo no encontrado", 404);

    set.headers['Content-Type'] = mimeType;
    set.status = 200; 
    return buffer;
  })
  .listen(Bun.env.PORT)

console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`);