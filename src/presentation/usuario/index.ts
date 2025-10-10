import Elysia from "elysia";

import { UserModel } from "./usuario.model";
import { tokenPlugin } from "../../config/tokens";
import { UserController } from "./usuario.controller";
import { authService } from "../services/auth.service";

export const usuarioRoutes = new Elysia({ prefix: "/user" })
    .decorate('userController', new UserController())
    .post("/", async ({ status, body, userController }) => {
        const usuario = await userController.doRegister(body)
        return status(201, `Usuario ${usuario.correo} creado`)
    }, {
        body: UserModel.signUpBody
    })
    .put("/", async ({ status, userController, body }) => {
        return status(200, "Login exitoso")
        // const {correo, role} = await userController.doLogin(body)
        // return status(200, {
        //     token: await tokenPlugin.sign({ correo, role })
        // })
    }, {
        body: UserModel.signInBody
    })
export const usuarioPrivateRoutes = new Elysia({ prefix: "/user" })
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