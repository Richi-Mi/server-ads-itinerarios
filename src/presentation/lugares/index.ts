import Elysia from "elysia";
import { LugarController } from "./lugares.controller";
import { LugarModel } from "./lugares.model";

import { authService } from "../services/auth.service";

export const lugarRoutes = new Elysia({ prefix: "/lugar", name: "Lugar" })
    .decorate('lugarController', new LugarController())
    //Se usa authService con .use(authService) para proteger las rutas
    .use(authService)
    .get("/", async ({ status, lugarController, query }) => {
        const lugares = await lugarController.getAllLugares(query);
        return status(200, lugares);
    }, {
        query: LugarModel.getLugaresQuery
    })
    .get("/:id", async ({ status, params, lugarController }) => {
        const lugar = await lugarController.getLugarById(params.id);
        return status(200, {...lugar});
    }, {
        params: LugarModel.getLugarParams
    })
    .post("/registro", async ({ status, body, lugarController }) => {
        const nuevoLugar = await lugarController.createLugar(body);
        return status(201, {...nuevoLugar});
    }, {
        body: LugarModel.regLugarCuerpo
    })
    .put("/:id", async ({ status, params, body, lugarController  }) => {
        // TODO: Check this route inmplementation.
        const lugarActualizado = await lugarController.updateLugar(params.id, body);
        return status(200, {...lugarActualizado});
    },{
        params: LugarModel.getLugarParams,
        body: LugarModel.modLugarCuerpo,
    })
    .delete("/:id", async ({ status, params, lugarController }) => {
        const lugarBorrado = await lugarController.deleteLugar(params.id);
        return status(200, {...lugarBorrado});
    },{
        params: LugarModel.getLugarParams,
    })