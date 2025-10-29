import { t } from "elysia";

export namespace LugarModel {
    export const getLugarParams = t.Object({
        id: t.String()
    });

    export const regLugarCuerpo = t.Object( //Para registrar el lugar
        {
            //id_api_place: t.String(),
            category: t.String(),
            mexican_state: t.String(),
            nombre: t.String(),
            latitud: t.Optional(t.Number()),
            longitud: t.Optional(t.Number()),
            foto_url: t.Optional(t.String()),
            google_score: t.Optional(t.Number()),
            total_reviews: t.Optional(t.Number())
        }
    );

    export type RegLugarCuerpo = typeof regLugarCuerpo.static;

    export const modLugarCuerpo = t.Object( //Para modificar el lugar
        {
            category: t.Optional(t.String()),
            mexican_state: t.Optional(t.String()),
            nombre: t.Optional(t.String()),
            latitud: t.Optional(t.Number()),
            longitud: t.Optional(t.Number()),
            foto_url: t.Optional(t.String()),
            // foto_url: t.Optional(t.File( { format: ["image/jpeg", "image/png", "image/jpg"] } )),
            google_score: t.Optional(t.Number()),
            total_reviews: t.Optional(t.Number())
        }
    )

    export type ModLugarCuerpo = typeof modLugarCuerpo.static;
}