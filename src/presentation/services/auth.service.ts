import Elysia, { t } from "elysia";

import { tokenPlugin } from "../../config/tokens";
import { CustomError } from "../../domain/CustomError";

type Payload = {
    correo: string, 
    role:   string
}

export const authService =  new Elysia({ name: 'service/auth' })
    .use(tokenPlugin)
    .state(
        {
            user: {} as Payload
        }
    )

    .guard(
        {
            headers: t.Object({
                token: t.String({
                    error: "Token es necesario"
                })
            })
        }
    )
    .onBeforeHandle({ as: 'scoped' }, async ({ store: { user }, tokenPlugin, headers: { token } }) => {                
        const areToken = await tokenPlugin.verify(token) as Payload;        
        if (!areToken)
            throw new CustomError("Token inválido o expirado", 401);

        user.correo = areToken.correo;
        user.role   = areToken.role;
    });

export const authRole = (rolRequerido: "admin" | string) => {
    return ({ store }: any) => {
        //if(!store.user)
        //{
        //    throw new CustomError(`No autenticado`, 401);
        //}
        //Se comentarizo porque authService ya verifica si hay token o no

        if(store.user.role !== rolRequerido)
        {
            throw new CustomError(`Acceso denegado: Se requiere ${rolRequerido} y tienes ${store.user.role}`, 403);
        }
    }
};