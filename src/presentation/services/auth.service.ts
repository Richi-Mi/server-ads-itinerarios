import Elysia, { t } from "elysia";

import { tokenPlugin } from "../../config/tokens";

type Payload = {
    correo: string, 
    role:   string
}

export const authService = new Elysia({ name: 'service/auth' })
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
    .onBeforeHandle({ as: 'scoped' }, async ({ store: { user }, tokenPlugin, headers: { token }, status }) => {  
        console.log('Hola pase por aqui');
              
        const areToken = await tokenPlugin.verify(token) as Payload;        
        if (!areToken)
            return status(401, "Token inválido o expirado");

        user.correo = areToken.correo;
        user.role   = areToken.role;
    })