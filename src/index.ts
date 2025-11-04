import Elysia, { t } from "elysia"; 
import cors from "@elysiajs/cors";
import { staticPlugin } from "@elysiajs/static";
import { PostgresDataSource } from "./data/PostgresDataSource";
import { userRoutes } from "./presentation/usuario";

import { lugarRoutes } from "./presentation/lugares";
import { itinerarioRoutes } from "./presentation/itinerario"
import { actividadRoutes } from "./presentation/actividad"

import { CustomError } from "./domain/CustomError";
import { authRoutes } from "./presentation/auth";
import { FileDataSource } from "./data/FileDataSource";

import { publicacionRoutes } from "./presentation/publicacion";

const app = new Elysia()
  .decorate('pgdb', PostgresDataSource)
  .onStart(async ({ decorator }: { decorator: any }) => { 
    try {
      console.log('Base de datos conectada');
      await decorator.pgdb.initialize();
    }
    catch (error) {
      console.error('Error al conectar con la base de datos:', error);
      process.exit(1);
    }
  })
  .onStop(async ({ decorator }: { decorator: any }) => { 
    await decorator.pgdb.destroy();
  })
  .error({
    'custom': CustomError
  })
  .onError(({ code, error, set }) => { 
    console.error(error);
    
    if (code === 'custom') {
      const customError = error as CustomError;
      set.status = customError.statusCode; 
      return customError.toResponse();
    }

    if (code === 'VALIDATION')
      return status(400, { message: error.customError });

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

    // Return the response.
    set.headers['Content-Type'] = mimeType;
    set.status = 200; 
    return buffer;
  })
  .listen(Bun.env.PORT)

console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`);

