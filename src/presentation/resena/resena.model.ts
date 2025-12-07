import { t } from "elysia";

export namespace ResenaModel {
    export const createResenaBody = t.Object({
        score: t.Number({
            minimum: 1,
            maximum: 5,
            error: "El puntaje debe ser un número entre 1 y 5"
        }),
        commentario: t.Optional(t.String())
    });

    export type CreateResenaBody = typeof createResenaBody.static;

    export const updateResenaBody = t.Object({
        score: t.Optional(t.Number({
            minimum: 1,
            maximum: 5,
            error: "El puntaje debe ser un número entre 1 y 5"
        })),
        commentario: t.Optional(t.String())
    });

    export type UpdateResenaBody = typeof updateResenaBody.static;

    export const resenaParams = t.Object({
        id: t.Numeric({ error: "El ID debe ser un número" })
    });

    export type ResenaParams = typeof resenaParams.static;

    export const publicacionParams = t.Object({
        id: t.Numeric({ error: "El ID de publicación debe ser un número" })
    });

    export type PublicacionParams = typeof publicacionParams.static;
}