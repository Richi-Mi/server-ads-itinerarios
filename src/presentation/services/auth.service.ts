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
                token: t.String()
            })
        }
    )
    .onBeforeHandle({ as: 'scoped' }, async ({ store: { user }, tokenPlugin, headers: { token }, status }) => {
        const areToken = await tokenPlugin.verify(token) as Payload;
        console.log('Pase por la verificacion');
        
        
        if (!areToken)
            return status(401, "No autorizado")

        user.correo = areToken.correo;
        user.role   = areToken.role;
    })