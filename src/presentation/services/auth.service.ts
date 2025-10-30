import Elysia, { t } from "elysia";

import { tokenPlugin } from "../../config/tokens";
import { CustomError } from "../../domain/CustomError";

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
        const areToken = await tokenPlugin.verify(token) as Payload;        
        if (!areToken)
            throw new CustomError("Token inválido o expirado", 401);

        user.correo = areToken.correo;
        user.role   = areToken.role;
    })