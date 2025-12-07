import { t } from "elysia";

export namespace ReporteModel {
    export const Create = t.Object({
        description: t.String({ error: "description es requerido" }),
        entity_id: t.String({ error: "entity_id es requerido" })
    });

    export const Update = t.Object({
        description: t.Optional(t.String()),
        entity_id: t.Optional(t.String())
    });

    export const Params = t.Object({
        id: t.String({ error: "id es requerido" })
    });
}
