import Elysia from "elysia";

import { UserModel } from "./usuario.model";
import { UserController } from "./usuario.controller";
import { authService } from "../services/auth.service";


export const userRoutes = new Elysia({ prefix: "/user", name: "Usuario" })
    .decorate('userController', new UserController())
    .use(authService)
    .get("/", async ({ status, store: { user: { correo } }, userController }) => {
        const user = await userController.getUserInfo(correo)
        if( !user )
            return status(404)

        return status(200, { ...user })
    })
    .put("/update", async ({ status, store: { user: { correo } }, body, userController }) => {
        const { password, ...userUpdated } = await userController.updateUser(correo, body)

        if(!userUpdated)
            return status(404, "Usuario no encontrado")

        return status(200, { ...userUpdated})
    }, {
        body: UserModel.updateUserBody
    })
    .delete("/", async ({ status, store: { user: { correo } }, userController }) => {
        const userDeleted = await userController.deleteUser(correo)

        if(!userDeleted)
            return status(404, "Usuario no encontrado")
        
        return status(201, { ...userDeleted })
    })
    