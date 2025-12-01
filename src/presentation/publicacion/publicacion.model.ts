import { t } from "elysia";

export namespace PublicacionModel {
    export const shareBody = t.Object({
        descripcion: t.String({ 
            minLength: 1, 
            error: "La descripción no puede estar vacía."
        }),
        privacity_mode: t.String({
            error: "Debe seleccionar un modo de privacidad."
        }),
        fotos: t.Optional(t.Array(t.File({
            formats: ["image/jpeg", "image/png"],
            error: "Las fotos deben ser imagenes."
        })))
    })
    export type ShareBody = typeof shareBody.static
};