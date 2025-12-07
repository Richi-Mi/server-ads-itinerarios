import { t } from "elysia";
export namespace AmigoModel {
    export const envioSolicitud = t.Object({
        receiving : t.String()
    }); 

    export const respondSolicitud = t.Object({
        Id: t.Number(), 
        state: t.Union([ t.Literal(0), t.Literal(1), t.Literal(2), t.Literal(3)])
    }); 

    export const searchFriend = t.Object({ q: t.String() }); 

    export const usuarioSugerido = t.Object({
        username: t.String(),
        nombre_completo: t.String(),
        correo: t.String(),
        foto_url: t.Union([t.String(), t.Null()])
    });

    export const amigosDeAmigosResponse = t.Object({
        message: t.String(),
        data: t.Array(usuarioSugerido)
    });

    export const bloquear = t.Object({ user: t.String() })
    export const desbloquear = t.Object({ user: t.String() })

}