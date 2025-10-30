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

    if (code === 'VALIDATION') {
      set.status = 400; 
      return { message: (error as any).customError || 'Error de validación' };
    }
    
    set.status = 500; 
    return { message: "Internal Server Error" };
  })
  .use(cors())
  .use(staticPlugin())
  .use(authRoutes)
  .use(userRoutes)

  .use(lugarRoutes)
  .use(itinerarioRoutes)
  .use(actividadRoutes)

  .use(publicacionRoutes) 

  .get('/fotos/:file', ({ params, status }) => {
      const fileDataSource = FileDataSource.getInstance()
      return status(200, fileDataSource.getFileFromSource(`/fotos/${params.file}`))
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

