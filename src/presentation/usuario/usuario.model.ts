import { t } from "elysia";

export namespace UserModel {
    export const updateUserBody = t.Object({
        username: t.Optional(t.String()),
        nombre_completo: t.Optional(t.String()),
        foto: t.Optional(
            t.File({ format: ["image/jpeg", "image/png", "image/jpg"] })
        ),
        privacity_mode: t.Optional(t.String())
    })

    export type UpdateUserBody = typeof updateUserBody.static

    export const updatePasswordBody = t.Object({
        newPassword: t.String({ error: "La contraseña es necesaria" })
    })

    export type UpdatePasswordBody = typeof updatePasswordBody.static

    export const verifyPasswordBody = t.Object({
        password: t.String({ error: "La contraseña es necesaria" })
    })

    export type VerifyPasswordBody = typeof verifyPasswordBody.static
}