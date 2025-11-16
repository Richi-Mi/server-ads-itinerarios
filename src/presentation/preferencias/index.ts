import Elysia, { t } from "elysia";
import { PreferenciasController } from "./preferencias.controller";
import { PreferenciasModel } from "./preferencias.model";

import { authService } from "../services/auth.service";

export const preferenciasRoutes = new Elysia({ prefix: "/preferencias", name: "Preferencias" })
.decorate("preferenciasController", new PreferenciasController())
.use(authService)

.post("/register", async ({ body, store, preferenciasController, status }) => {
    const newAnswer = await preferenciasController.registerAnswer(body, store.user); 
    return status(201, newAnswer); 
}, {
    body: PreferenciasModel.regisAnswer, 
    headers: t.Object({ token: t.String() }) // necesario el token front
})

.get("/", async ( { preferenciasController, status }) => {
    const allAns = await preferenciasController.getAllAnswers(); 
    return status(200, allAns); 
})

.get("/correo/:correo", async ( { params, preferenciasController, status }) => {
    const email = params.correo; 
    if(!email)
        return status(404, "El correo no existe")
    const userAns = await preferenciasController.getAnswerUser(email); 
    return status(200, {...userAns}); 
}, {
   params: PreferenciasModel.getUserParams
}); 