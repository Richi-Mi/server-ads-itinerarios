import Elysia from "elysia";
import cors from "@elysiajs/cors";
import { staticPlugin } from "@elysiajs/static";

import { PostgresDataSource } from "./data/PostgresDataSource";
import { userRoutes } from "./presentation/usuario";
import { CustomError } from "./domain/CustomError";
import { authRoutes } from "./presentation/auth";

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
    if (error instanceof CustomError && code === 'custom')
      return status(error.statusCode, error.toResponse());

    if( code === 'VALIDATION' )
      return status(400, { message: error.customError });
    
    return status(500, { message: "Internal Server Error. No sabemos qué hiciste. (O hicimos algo mal)" });
  })
  .use(cors())
  .use(staticPlugin())
  .use(authRoutes)
  .use(userRoutes)
  .listen(Bun.env.PORT)

console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`);
