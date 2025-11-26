import { t } from "elysia";

export namespace RecommendationModel {
    export const postRecommendationBody = t.Object({
        lugarIds: t.Optional(t.Array(t.String())),
        query: t.Optional(t.String()),
        limit: t.Optional(t.Number({ default: 10 }))
    });

    export type PostRecommendationBody = typeof postRecommendationBody.static;

    export const postOptimizationBody = t.Object({
        lugarIds: t.Array(t.String(), { error: "Debe enviar al menos un lugar" }) // Array de IDs de lugares (obligatorio)
    });

    export type PostOptimizationBody = typeof postOptimizationBody.static;
}