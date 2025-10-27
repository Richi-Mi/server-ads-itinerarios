import { t } from "elysia";

export namespace ItinerarioModel {
    export const getItinerarioParams = t.Object({
        id: t.String()
    });

    export const regItinerarioCuerpo = t.Object( //Para registrar el itinerario
        {
            title: t.String(),
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