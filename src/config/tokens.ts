import Elysia from "elysia";
import { jwt } from "@elysiajs/jwt"

export const tokenPlugin = new Elysia({ name: 'plugin/token' })
    .use(
        jwt({
            name: "tokenPlugin",
            secret: Bun.env.SECRET_KEY
        })
    )