import { t } from "elysia";

export namespace ItinerarioModel {
    export const getItinerarioParams = t.Object({
        id: t.String()
    });

    export const regItinerarioCuerpo = t.Object({
            title: t.String({ error: "Debe llevar un título el itinerario" }),
            actividades: t.Optional(
                t.Array(
                    t.Object({
                        fecha: t.Optional(t.String({ error: "Debe llevar una hora de inicio" })),
                        description: t.String({ error: "Debe llevar una descripción" }),
                        lugarId: t.String({ error: "Debe llevar un lugar" })
                    })
                )
            )
        }
    );

    export type RegItinerarioCuerpo = typeof regItinerarioCuerpo.static;

    export const modItinerarioCuerpo = t.Object( //Para modificar el itinerario
        {
            title: t.Optional(t.String()),
        }
    )

    export type ModItinerarioCuerpo = typeof modItinerarioCuerpo.static;
}