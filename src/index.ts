import Elysia from "elysia";
import cors from "@elysiajs/cors";

import { PostgresDataSource } from "./data/PostgresDataSource";
import { usuarioPrivateRoutes, usuarioRoutes } from "./presentation/usuario";

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
  .use(cors())
  .get("/", () => "Server is running")
  .use(usuarioRoutes)
  .use(usuarioPrivateRoutes)
  .listen(Bun.env.PORT)

console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`);