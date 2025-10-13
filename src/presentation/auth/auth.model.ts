import { t } from "elysia"

export namespace AuthModel {

    export const signUpBody = t.Object({
        nombre: t.String({ error: "El nombre es necesario" }),
        correo: t.String({ error: "El correo es necesario" }),
        password: t.String({ error: "La contraseña es necesaria" }),
        foto: t.Optional(
            t.File({ format: ["image/jpeg", "image/png", "image/jpg"] })
        )
    })

    export type SignUpBody = typeof signUpBody.static

    export const signInBody = t.Object({
        correo:     t.String({ error: "El correo es necesario" }),
        password:   t.String({ error: "La contraseña es necesaria" })
    })
    
    export type SignInBody = typeof signInBody.static
    
}