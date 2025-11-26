import { t } from "elysia";

export const PublicacionModel = {
    
    shareBody: t.Object({
        descripcion: t.String({ 
            minLength: 1, 
            error: "La descripción no puede estar vacía."
        }),
        privacity_mode: t.Boolean({
            error: "Debe seleccionar un modo de privacidad."
        })
    })
};