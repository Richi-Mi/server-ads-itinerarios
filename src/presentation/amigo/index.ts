import Elysia from "elysia";
import { AmigoController } from "./amigo.controller";
import { AmigoModel } from "./amigo.modelo";
import { PostgresDataSource } from "../../data/PostgresDataSource";
import { authService } from "../services/auth.service";
import { Amigo, Usuario } from "../../data/model";

/**
 * * Rutas CRUD FRIENDSHIP
 * @author Fenix
 * @link POST /solicitud    ->   body  "receiving": "friend email add" - Enviar una solicitud 
 * @link PUT  /respond      ->  body  "Id": num "state": num_action    - Responder solicitud
 * @link GET  /pendiente    - Ver lista de solicitudes aun no respondidas 
 * @link GET  /             - Ver lista de friends 
 */
export const amigoRoutes = new Elysia({ prefix: "/amigo", name: "Amigo" })
 .use(authService)
 .decorate("amigoController", new AmigoController(PostgresDataSource.getRepository(Amigo), PostgresDataSource.getRepository(Usuario)))
 .post("/solicitud", async ({ store: { user }, body, amigoController }) => {
    const res = await amigoController.sendRequest(user.correo, body.receiving ); 
    return { message: "Solicitud enviada", data: res  };
 }, 
 { body: AmigoModel.envioSolicitud})

 .put("/respond", async ({ store: { user }, body, amigoController }) => {
    let action: "FRIEND" | "REJECT"; 
    if (body.state === 1) action = "FRIEND";
    else if (body.state === 2) action = "REJECT";
    else throw new Error("Estado de respuesta inválido");
    const res = await amigoController.respondRequest(body.Id, action, user.correo ); 
    return { message: "Solicitud actualizada", data: res  };
 }, 
 { body: AmigoModel.respondSolicitud }) 

 .get("/pendiente", async ({ store: { user }, amigoController }) => {
    const requests = await amigoController.listRequest(user.correo);
    if (requests.length === 0)
        return { message: "No tienes solicitudes" };

    return { message: "Solicitudes encontradas", data: requests };
  })

 .get("/", async ({ store, amigoController }) => {
    return amigoController.listFriend(store.user.correo);
  })



 
