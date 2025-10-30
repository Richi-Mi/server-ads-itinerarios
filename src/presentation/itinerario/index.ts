import Elysia from "elysia";
import { ItinerarioController } from "./itinerario.controller";
import { ItinerarioModel } from "./itinerario.model";

import { authService } from "../services/auth.service";

import { t } from "elysia";

export const itinerarioRoutes = new Elysia({ prefix: "/itinerario", name: "Itinerario" })
    .decorate('itinerarioController', new ItinerarioController())
    .use(authService)
    .get("/", async ({ status, store, itinerarioController }) => {
        try {
            const itinerarios = await itinerarioController.getAllItinerarios(store.user);
            return status(200, itinerarios);
        }
        catch (error) {            
            throw error;
        }
    })

    .get("/:id", async ({ status, params, store, itinerarioController }) => {
        try {
            const itinerario = await itinerarioController.getItinerarioById(params.id, store.user);
            return status(200, {...itinerario});
        }
        catch (error) {            
            throw error;
        }
    }, {
        params: ItinerarioModel.getItinerarioParams
    })

    .post("/registro", async ({ status, body, store, itinerarioController }) => {
        try {
            const nuevoItinerario = await itinerarioController.createItinerario(body, store.user);
            return status(201, {...nuevoItinerario});
        }
        catch (error) {
            throw error;
        }
    }, {
        body: ItinerarioModel.regItinerarioCuerpo
    })

    .put("/:id", async ({ status, params, body, store, itinerarioController  }) => {
        const itinerarioActualizado = await itinerarioController.updateItinerario(params.id, body, store.user);
        return status(200, {...itinerarioActualizado});
    },{
        params: t.Object({ id: t.String() }),
        body: ItinerarioModel.modItinerarioCuerpo,
    })

    .delete("/:id", async ({ status, params, store, itinerarioController }) => {
        const itinerarioBorrado = await itinerarioController.deleteItinerario(params.id, store.user);
        return status(200, {...itinerarioBorrado});
    },{
        params: ItinerarioModel.getItinerarioParams
    })