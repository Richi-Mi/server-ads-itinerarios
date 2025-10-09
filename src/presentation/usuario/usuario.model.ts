import { t } from "elysia";

export namespace UserModel {
    export const signUpBody = t.Object({
        nombre: t.String(),
        correo: t.String(),
        password: t.String(),
        role: t.String(),
        foto: t.Optional( t.String() ),
        privacity_mode: t.Boolean()
    })
    export type SignUpBody = typeof signUpBody.static

    export const signInBody = t.Object({
        correo:     t.String(),
        password:   t.String()
    })
    export type SignInBody = typeof signInBody.static
}