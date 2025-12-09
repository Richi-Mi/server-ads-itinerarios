import Elysia from "elysia";

import { PostgresDataSource } from "../../data/PostgresDataSource";
import { authService } from "../services/auth.service";
import { NotificacionController } from "./notificacion.controller";
import { NotificacionModel } from "./notificacion.model";
import { Notificacion, Usuario } from "../../data/model";

/**
 * * Rutas CRUD NOTIFICACION
 * @author Harol
 * @link GET /              -> carga las notificaciones de la BD
 * @link POST /solicitud    ->   body  "receiving": "friend email or username add " - Enviar una solicitud
 * @link PUT  /respond      ->  body  "Id": num "state": num_action    - Responder solicitud
 * @link GET  /pendiente    - Ver lista de solicitudes aun no respondidas
 */
export const notificacionRoutes = new Elysia({
  prefix: "/notificacion",
  name: "Notificacion",
})
  .use(authService)
  .decorate(
    "notificacionController",
    new NotificacionController(
      PostgresDataSource.getRepository(Notificacion),
      PostgresDataSource.getRepository(Usuario)
    )
  )
  .get("/", async ({ store, notificacionController }) => {
    return notificacionController.listNotificacion(store.user.correo);
  })
  .patch("/read/:id", async ({ params, store, notificacionController }) => {
    const notificacionId = parseInt(params.id);
    return notificacionController.markAsRead(notificacionId, store.user.correo);
  });
