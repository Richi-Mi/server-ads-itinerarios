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
import { preferenciasRoutes } from "./presentation/preferencias";
import { amigoRoutes } from "./presentation/amigo";
import { recomendacionRoutes } from "./presentation/preferencias/recomendacion";

const app = new Elysia()
  .decorate('pgdb', PostgresDataSource)
  .onStart(async ({ decorator }) => { 
    
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
    
    await decorator.pgdb.destroy();
  })
  .error({ 'custom': CustomError })
  .onError(({ code, error, status }) => {     
 
    if (code === 'custom') {
      const customError = error as CustomError;
      return status( customError.statusCode, customError.toResponse());
    }

    if (code === 'VALIDATION')
      return status(400, { message: error.customError });

    if (code === 'NOT_FOUND')
      return status(404, { message: "Recurso no encontrado" });

    return status(500, { message: "Internal Server Error" });

  })
  .use(cors())
  .use(staticPlugin())
  .use(authRoutes)
  .use(userRoutes)
  .use(preferenciasRoutes)
  .use(recomendacionRoutes)
  .use(amigoRoutes)
  .use(lugarRoutes)
  .use(itinerarioRoutes)
  .use(actividadRoutes)
  .use(publicacionRoutes)
  .get('/fotos/:file', async ({ params, set }) => {
      const fileDataSource = FileDataSource.getInstance();
      const { mimeType, buffer } = await fileDataSource.getFileFromSource(params.file); 
      if (!buffer || buffer.length === 0) {
        throw new CustomError("Archivo no encontrado", 404);
      }
      set.headers['Content-Type'] = mimeType;
      set.status = 200;
      return buffer;
  }, {
      params: t.Object({
          file: t.String({ error: "El nombre del archivo debe ser un texto" })
      })
  })

  
  .get("*", ({ status }) => {
    return status(404, { message: "Ruta no encontrada" });
  })
  .listen(Bun.env.PORT)

console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`);