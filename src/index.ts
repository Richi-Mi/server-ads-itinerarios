import Elysia from "elysia";
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
  .error({
    'custom': CustomError
  })
  .onError(({ error, status, code }) => {
    // TODO: Quit this in production    
    console.error(error);
    if (error instanceof CustomError && code === 'custom')
      return status(error.statusCode, error.toResponse());

    if( code === 'VALIDATION' )
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
  .get('/fotos/:file', ({ params: { file }, status }) => {
        const fileDataSource = FileDataSource.getInstance()
        return status(200, fileDataSource.getFileFromSource(`/fotos/${file}`))
    })
  .listen(Bun.env.PORT)

console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`);
