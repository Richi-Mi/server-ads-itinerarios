import Elysia from "elysia";
import cors from "@elysiajs/cors";

import { PostgresDataSource } from "./data/PostgresDataSource";
import { usuarioRoutes } from "./presentation/usuario";

const app = new Elysia()
  .decorate('db', PostgresDataSource)
  .onStart(async ({ decorator }) => {
    try {
      console.log('Base de datos conectada');
      await decorator.db.initialize();
    }
    catch (error) {
      console.error('Error al conectar con la base de datos:', error);
      process.exit(1);
    }
  })
  .onStop(async ({ decorator }) => {
    await decorator.db.destroy();
  })
  .use(cors())
  .get("/", () => "Server is running")
  .use(usuarioRoutes)
  .listen(Bun.env.PORT)

console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`);