import { t } from "elysia";

export namespace ActividadModel
{
    export const getActividadParams = t.Object({
        id: t.String()
    });

    export const regActividadCuerpo = t.Object({
        start_time: t.Date(),
        end_time: t.Date(),
        description: t.String(),
        id_api_place: t.String(),
        id_itinerario: t.Number(),
    });

    export type RegActividadCuerpo = typeof regActividadCuerpo.static;

    export const modActividadCuerpo = t.Object({
        start_time: t.Optional(t.Date()),
        end_time: t.Optional(t.Date()),
        description: t.Optional(t.String()),
    });

    export type ModActividadCuerpo = typeof modActividadCuerpo.static;
}

