import Elysia from "elysia";

import { UserModel } from "./usuario.model";
import { tokenPlugin } from "../../config/tokens";
import { UserController } from "./usuario.controller";
import { authService } from "../services/auth.service";

export const usuarioRoutes = new Elysia({ prefix: "/user" })
    .decorate('userController', new UserController())
    .post("/", async ({ status, body, userController }) => {
        await userController.doRegister(body)
        return status(201, "Usuario creado")
    }, {
        body: UserModel.signUpBody
    })
    .use(tokenPlugin)
    .put("/", async ({ status, userController, body, tokenPlugin }) => {
        // const {correo, role} = await userController.doLogin(body)
        // return status(200, {
        //     token: await tokenPlugin.sign({ correo, role })
        // })
    }, {
        body: UserModel.signInBody
    })
    .use(authService)
    .get("/", async ({ status, userController, store: { user: { correo } } }) => {
        // const user = await userController.getUserInfo(correo)
        // if( !user )
        //     return status(404)
        // return status(200, user)
    })
    .delete("/", async ({ status, userController, store: { user: { correo }} }) => {
        // const userDeleted = await userController.deleteUser(correo)
        // if(!userDeleted)
        //     return status(404)
        // return status(200, userDeleted)
    })