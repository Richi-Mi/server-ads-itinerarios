import Elysia, { t } from "elysia";
import { PublicacionController } from "./publicacion.controller";
import { authService } from "../services/auth.service";
import { PublicacionModel } from "./publicacion.model";
import { AmigoController } from "../amigo/amigo.controller";
import { NotificacionController } from "../notificacion/notificacion.controller";
import { UserController } from "../usuario/usuario.controller";
import { PostgresDataSource } from "../../data/PostgresDataSource";
import { Amigo, Usuario, Notificacion } from "../../data/model";
import { NotificationType } from "../../data/model";
import { notificarUsuario } from "../../sockets/socketHandler";


export const publicacionRoutes = new Elysia({
  prefix: "/publicacion",
  name: "Publicacion",
})
  .decorate("publicacionController", new PublicacionController())
  .use(authService)

  .get(
    "/:id/promedio",
    async ({ params, publicacionController, status }) => {
      const id = Number(params.id);
      const promedio = await publicacionController.getAverageRating(id);
      return status(200, promedio);
    },
    {
      params: t.Object({
        id: t.Numeric({ error: "El ID debe ser un número" }),
      }),
    }
  )

  .get("/", async ({ status, store, publicacionController }) => {
    const userCorreo = store.user.correo;
    const publicaciones = await publicacionController.getMyPublications(userCorreo);
    return status(200, publicaciones);
  })

  .post(
    "/share/:id",
    async ({
      params,
      body,
      store,
      publicacionController,
      status,

    }) => {
      const itinerarioId = Number(params.id);
      const userCorreo = store.user.correo;

      // 1. Crear Publicación
      const nuevaPublicacion = await publicacionController.shareItinerary(
        itinerarioId,
        userCorreo,
        body
      );
      const userRepo = PostgresDataSource.getRepository(Usuario);
      const amigoRepo = PostgresDataSource.getRepository(Amigo);
      const notifRepo = PostgresDataSource.getRepository(Notificacion);

      const usuarioController = new UserController(userRepo);
      const amigoController = new AmigoController(amigoRepo, userRepo);

      try {
        const usuario = await usuarioController.getUserInfo(userCorreo);
        const misAmigos = await amigoController.listFriend(userCorreo);

        if (misAmigos && usuario) {
            for (const amigo of misAmigos) {
                 const destinatario = 
                    (amigo.requesting_user && amigo.requesting_user.correo === userCorreo)
                    ? amigo.receiving_user 
                    : amigo.requesting_user;
                 
                 // Validación extra por si acaso
                 if (!destinatario) continue;

                 // A. GUARDAR EN BD (Usando Repositorio Directo es más rápido aquí)
                 const newNotificacion = new Notificacion();
                 newNotificacion.type = NotificationType.POST; // Asegúrate de tener este Enum
                 newNotificacion.isRead = false;
                 newNotificacion.emisor = usuario;
                 newNotificacion.receptor = destinatario;
                 newNotificacion.resourceId = nuevaPublicacion.id;
                 newNotificacion.previewText = "ha hecho una nueva publicación";
                 newNotificacion.date = new Date(); // Si tu modelo lo pide

                 await notifRepo.save(newNotificacion);

                 // B. ENVIAR SOCKET
                 notificarUsuario(destinatario.correo, {
                    tipo: "NUEVA_PUBLICACION", // O usa el Enum si el front lo soporta
                    actorName: usuario.nombre_completo || usuario.username,
                    actorUsername: usuario.username,
                    actorAvatar: usuario.foto_url || "",
                    mensaje: "ha hecho una nueva publicación",
                    linkId: nuevaPublicacion.id,
                    fecha: new Date()
                 });
            }
        }
      } catch (error) {
        console.error("Error en notificaciones (no bloqueante):", error);
        // No hacemos throw para que al menos retorne la publicación creada
      }

      return status(201, { ...nuevaPublicacion });
    },
    {
      body: PublicacionModel.shareBody,
      params: t.Object({
        id: t.Numeric({ error: "El ID del itinerario debe ser un número" }),
      }),
    }
  );
