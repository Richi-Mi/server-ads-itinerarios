import { t } from "elysia";

export namespace UserModel {

    export const signUpBody = t.Object({
        nombre: t.String(),
        correo: t.String(),
        password: t.String(),
        foto: t.Optional(
            t.File({ format: ["image/jpeg", "image/png", "image/jpg"] })
        ),
        privacity_mode: t.String()
    })

    export type SignUpBody = typeof signUpBody.static

    export const signInBody = t.Object({
        correo:     t.String(),
        password:   t.String()
    })
    
    export type SignInBody = typeof signInBody.static
}