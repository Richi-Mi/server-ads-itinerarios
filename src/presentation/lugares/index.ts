import Elysia from "elysia";
import { LugarController } from "./lugares.controller";
import { LugarModel } from "./lugares.model";

//Importar authService si se quieren proteger estas rutas
import { authService } from "../services/auth.service";

export const lugarRoutes = new Elysia({ prefix: "/lugar", name: "Lugar" })
    //Se instancia el controlador
    .decorate('lugarController', new LugarController())
    
    //Se usa authService con .use(authService) para proteger las rutas
    .use(authService)
    .get("/", async ({ status, lugarController }) => {
        
        const lugares = await lugarController.getAllLugares();
        
        //No necesitamos verificar si esta vacio, un array vacio es una respuesta valida (200 OK)
        return status(200, {...lugares});
    })

    //Para obtener un lugar
    .get("/:id", async ({ status, params, lugarController }) => {
        
        //'params.id' viene de la URL
        // El controlador lanza el error 404 si no lo encuentra
        const lugar = await lugarController.getLugarById(params.id);
        
        return status(200, {...lugar});
    }, {
        //Validador del Modelo para los parámetros
        params: LugarModel.getLugarParams
    })

    .post("/registro", async ({ status, body, lugarController }) => {
        const nuevoLugar = await lugarController.createLugar(body);
        return status(201, {...nuevoLugar});
    }, {
        body: LugarModel.regLugarCuerpo
    })

    .put("/:id", async ({ status, params, body, lugarController  }) => {
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