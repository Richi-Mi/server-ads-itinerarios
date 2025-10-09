import Elysia from "elysia";

import cors from '@elysiajs/cors'

import { usuarioRoutes } from "./usuario";

export class Server {
    public static start() {
        const app = new Elysia()
            .use(cors())
            .use(usuarioRoutes)
            .listen(Bun.env.PORT)
        
        console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`);
    }
}