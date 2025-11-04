import Elysia, { t } from "elysia"; 
import { UserModel } from "./usuario.model";
import { UserController } from "./usuario.controller";
import { authService } from "../services/auth.service";


export const userRoutes = new Elysia({ prefix: "/user", name: "Usuario" })
    .use(authService)
    .decorate('userController', new UserController())
    .get("/", async ({ status, store: { user: { correo } }, userController }) => {
  
    })
    .put("/update", async ({ status, store: { user: { correo } }, body, userController }) => {
    
    }, {
        body: UserModel.updateUserBody
    })
    .post("/verify-password", async ({ status, store: { user: { correo } }, body, userController }) => {
        
    }, {
        body: UserModel.verifyPasswordBody
    })
    .put("/update-password", async ({ status, store: { user: { correo }}, body, userController }) => {
        
    }, {
        body: UserModel.updatePasswordBody
    })
    .delete("/", async ({ status, store: { user: { correo } }, userController }) => {
       
    })
    .get("/search", async ({ status, query, userController }) => {
       
        const searchTerm = query.q;

        const users = await userController.searchTravelers(searchTerm);

        return status(200, users);

    }, {
        
        query: UserModel.searchQuery
    })
 
