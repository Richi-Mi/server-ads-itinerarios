import { t } from "elysia";

export namespace RecommendationModel {
    export const getRecommendationParams = t.Object({
        itinerarioId: t.String()
    });

    export const getRecommendationQuery = t.Object({
        limit: t.Optional(t.Number({ default: 10 })),
        includeScores: t.Optional(t.Boolean({ default: false }))
    });

    export type GetRecommendationParams = typeof getRecommendationParams.static;
    export type GetRecommendationQuery = typeof getRecommendationQuery.static;
}
