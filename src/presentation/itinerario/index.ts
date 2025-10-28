import Elysia from "elysia";
import { ItinerarioController } from "./itinerario.controller";
import { ItinerarioModel } from "./itinerario.model";

import { authService } from "../services/auth.service";

import { t } from "elysia";

export const itinerarioRoutes = new Elysia({ prefix: "/itinerario", name: "Itinerario" })
    .decorate('itinerarioController', new ItinerarioController())
    
    .use(authService)

    .get("/", async ({ status, store, itinerarioController }) => {
        
        const itinerarios = await itinerarioController.getAllItinerarios(store.user);
        
        //No necesitamos verificar si esta vacio, un array vacio es una respuesta valida (200 OK)
        // return status(200, {...itinerarios});
        return status(200, itinerarios);
    })

    .get("/:id", async ({ status, params, store, itinerarioController }) => {
        const itinerario = await itinerarioController.getItinerarioById(params.id, store.user);
        
        return status(200, {...itinerario});
    }, {
        params: ItinerarioModel.getItinerarioParams
    })

    .post("/registro", async ({ status, body, store, itinerarioController }) => {
        const nuevoItinerario = await itinerarioController.createItinerario(body, store.user);
        return status(201, {...nuevoItinerario});
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