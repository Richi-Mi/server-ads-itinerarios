import Elysia from "elysia"; 

import { UserModel } from "./usuario.model";
import { authService } from "../services/auth.service";
import { UserController } from "./usuario.controller";

/**
 * * Rutas implementadas para la gestión de la información del usuario.
 * @author Mendoza Castañeda José Ricardo
 * @link GET    /user                 - Obtiene la información del usuario.
 * @link PUT    /user/update          - Actualiza información del usuario.
 * @link POST   /user/verify-password - Verifica si la contraseña es correcta.
 * @link PUT    /user/update-password - Actualiza la contraseña una vez verificada.
 * @link DELETE /user                 - Elimina el usuario.
 * @author Peredo Borgonio Daniel
 * @link GET    /user/search          - Busca usuarios por nombre o correo.
 */
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
    .post("/verify-password", async ({ status, store: { user: { correo } }, body, userController }) => {
        const { password } = body;
        const isValid = await userController.verifyPassword(correo, password);
        if (!isValid) {
            return status(401, { message: "Contraseña incorrecta" });
        }
        return status(200, { message: "Contraseña verificada correctamente" });
    }, {
        body: UserModel.verifyPasswordBody
    })
    .put("/update-password", async ({ status, store: { user: { correo }}, body, userController }) => {
        const { newPassword } = body; 
        await userController.updatePassword(correo, newPassword);
        return status(202, { message: "Contraseña actualizada correctamente" });
    }, {
        body: UserModel.updatePasswordBody
    })
    .delete("/", async ({ status, store: { user: { correo } }, userController }) => {
        const userDeleted = await userController.deleteUser(correo)
        if(!userDeleted)
            return status(404, "Usuario no encontrado")
        
        return status(201, { ...userDeleted })
    })
    .get("/search", async ({ status, query, userController }) => {
        const searchTerm = query.q;
        const users = await userController.searchTravelers(searchTerm);
        return status(200, users);
    }, {
        query: UserModel.searchQuery
    })