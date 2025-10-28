import Elysia from "elysia";

import { ActividadModel } from "./actividad.model";
import { ActividadController } from "./actividad.controller";

import { authService } from "../services/auth.service";

export const actividadRoutes = new Elysia({ prefix: "/actividad", name: "Actividad"})
    .decorate('actividadController', new ActividadController())

    .use(authService)

    //Para ver todas las actividades de todos los itinerarios
    .get("/", async({ status, store, actividadController }) => {
        const actividades = await actividadController.getAllActividades(store.user);
        return status(200, actividades);
    })

    //Para ver todas las actividades de un itinerario especifico
    .get("/por-itinerario/:id", async({ status, store, params, actividadController }) => {
        const actividades = await actividadController.getActividadesByItinerario(params.id, store.user);

        return status(200, actividades);
    },{
        params: ActividadModel.getActividadParams
    })

    //Para registrar una nueva actividad en un itinerario
    .post("/", async({status, store, body, actividadController}) => {
        const nuevaActividad = await actividadController.createActividad(body, store.user);
        return status(201, {...nuevaActividad});
    },{
        body: ActividadModel.regActividadCuerpo
    })

    //Para modificar la descripcion o fechas de inicio o fin de una actividad
    .put("/:id", async({status, params, store, body, actividadController}) => {
        const actividad = await actividadController.updateActividad(body, params.id, store.user);

        return status(200, {...actividad});
    },{
        params: ActividadModel.getActividadParams,
        body: ActividadModel.modActividadCuerpo,
    })

    //Para borrar una actividad de un itinerario
    .delete("/:id", async({ status, params, store, actividadController }) => {
        const actividadBorrada = await actividadController.deleteActividad(params.id, store.user);
        return status(200, {...actividadBorrada});
    },{
        params: ActividadModel.getActividadParams,
    });