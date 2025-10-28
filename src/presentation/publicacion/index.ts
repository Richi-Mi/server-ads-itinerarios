import Elysia from "elysia";
import { PublicacionController } from "./publicacion.controller";
import { authService } from "../services/auth.service";
export const publicacionRoutes = new Elysia({ prefix: "/publicacion", name: "Publicacion" })
    .decorate('publicacionController', new PublicacionController())
    
    // Opcional: Si no necesitamos que el usuario esté autenticado para ver el promedio,
    // comenta la siguiente línea. Para esta funcionalidad,
    .use(authService) 
    
    .get("/:id/promedio", async ({ params, publicacionController, status }) => {
        const id = Number(params.id); 
        const promedio = await publicacionController.getAverageRating(id);
        return status(200, promedio);
    });
