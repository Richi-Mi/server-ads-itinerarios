import { Elysia, status } from "elysia"
import { RecomendacionController } from "./recomendacion.controller"

import { authService } from "../../services/auth.service"

/**
 * * Ruta para recomendacion new user
 * @author Fenix
 * @link GET  /             - Ver la recomendacion del user
 */

export const recomendacionRoutes = new Elysia({ prefix: "/recomendacion", name: "Recomendacion"})
  .use(authService)
  .decorate("recomendacionController", new RecomendacionController())

  .get("/", async ({ recomendacionController, store: { user } }) => {
    const recomendaciones = await recomendacionController.getRecomendacion(user.correo); 
    return status(200, recomendaciones); 
  })