import Elysia from "elysia";

import { UserModel } from "./usuario.model";
import { tokenPlugin } from "../../config/tokens";
import { UserController } from "./usuario.controller";
import { authService } from "../services/auth.service";


export const userRoutes = new Elysia({ prefix: "/user", name: "Usuario" })
    .use(authService)
    .get("/", async ({ status, store: { user: { correo } } }) => {
        // const user = await userController.getUserInfo(correo)
        // if( !user )
        //     return status(404)
        // return status(200, user)
        return status(200, { correo })
    })
    .delete("/", async ({ status, store: { user: { correo }} }) => {
        // const userDeleted = await userController.deleteUser(correo)
        // if(!userDeleted)
        //     return status(404)
        // return status(200, userDeleted)
    })