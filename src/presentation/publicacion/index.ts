import Elysia, { t } from "elysia"; 
import { PublicacionController } from "./publicacion.controller";
import { authService } from "../services/auth.service";
import { PublicacionModel } from "./publicacion.model";

export const publicacionRoutes = new Elysia({ prefix: "/publicacion", name: "Publicacion" })
    .decorate('publicacionController', new PublicacionController())
    
    .get("/:id/promedio", async ({ params, publicacionController, status }) => {
        const id = Number(params.id); 
        const promedio = await publicacionController.getAverageRating(id);
        return status(200, promedio);
    }, {
        params: t.Object({
            id: t.Numeric({ error: "El ID debe ser un número" })
        })
    })
    .use(authService)

    .get("/", async ({ status, store, publicacionController }) => {
        const userCorreo = store.user.correo;
        const publicaciones = await publicacionController.getMyPublications(userCorreo);
        return status(200, publicaciones);
    })

    .post("/share/:id", async ({ params, body, store, publicacionController, status }) => {
        
        const itinerarioId = Number(params.id);
        const userCorreo = store.user.correo;

        const nuevaPublicacion = await publicacionController.shareItinerary(
            itinerarioId, 
            userCorreo, 
            body
        );

        return status(201, { ...nuevaPublicacion }); 
    
    }, {
        body: PublicacionModel.shareBody, 
        params: t.Object({
            id: t.Numeric({ error: "El ID del itinerario debe ser un número" })
        })
    });