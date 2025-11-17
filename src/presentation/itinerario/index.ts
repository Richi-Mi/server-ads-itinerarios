
import Elysia, { status } from "elysia";
import { ItinerarioController } from "./itinerario.controller";

// import Elysia from "elysia";

import { ItinerarioModel } from "./itinerario.model";
// import { ItinerarioController } from "./itinerario.controller";

import { authService } from "../services/auth.service";

// TODO: Probar la ruta de PUT /:id para actualizar itinerarios.

/**
 * * Rutas implementadas para la gestión de itinerarios.
 * @author Mendoza Castañeda José Ricardo
 * @author Gonzalez Lopez Alan Antonio.
 * @link GET /itinerario          - Obtiene los itinerarios del usuario autenticado.
 * @link GET /itinerario/:id      - Obtiene un itinerario por su ID.
 * @link POST /itinerario/registro - Crea un nuevo itinerario.
 * @link DELETE /itinerario/:id   - Elimina un itinerario por su ID.
 */
export const itinerarioRoutes = new Elysia({ prefix: "/itinerario", name: "Itinerario" })
    .decorate('itinerarioController', new ItinerarioController())
    .use(authService)
    .get("/", async ({ status, store, itinerarioController }) => {
        const itinerarios = await itinerarioController.getAllItinerarios(store.user);
        return status(200, itinerarios);
    })

    .get("/:id", async ({ status, params, store, itinerarioController }) => {
        const itinerario = await itinerarioController.getItinerarioById(params.id, store.user);
        return status(200, { ...itinerario });    
    }, {
        params: ItinerarioModel.getItinerarioParams
    })

    .post("/registro", async ({ status, body, store, itinerarioController }) => {
        const nuevoItinerario = await itinerarioController.createItinerario(body, store.user);
        return status(201, { ...nuevoItinerario });
    }, {
        body: ItinerarioModel.regItinerarioCuerpo
    })

    .put("/:id", async ({ status, params, body, store, itinerarioController  }) => {
        const itinerarioActualizado = await itinerarioController.updateItinerario(params.id, body, store.user);
        return status(200, { ...itinerarioActualizado });
    },{
        params: ItinerarioModel.getItinerarioParams,
        body: ItinerarioModel.modItinerarioCuerpo,
    })

    .delete("/:id", async ({ status, params, store, itinerarioController }) => {
        const itinerarioBorrado = await itinerarioController.deleteItinerario(params.id, store.user);
        return status(200, { ...itinerarioBorrado });
    },{
        params: ItinerarioModel.getItinerarioParams
    })

    
    .get("/buscar", async ({ query, itinerarioController, status }) => {
        const term = query.q; 
        const resultados = await itinerarioController.buscarItinerarios(term)

        if (resultados.length === 0)
          return status(200, { message: "No se encontraron resultados" });

        return status(200, resultados);
    }, {
        query: ItinerarioModel.buscarIti
    }); 

