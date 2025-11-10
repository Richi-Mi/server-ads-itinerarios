import Elysia from "elysia";
import { RecommendationController } from "./recommendation.controller";
import { RecommendationModel } from "./recommendation.model";
import { authService } from "../services/auth.service";

export const recommendationRoutes = new Elysia({ 
    prefix: "/recommendation", 
    name: "Recommendation" 
})
    .decorate('recommendationController', new RecommendationController())
    .use(authService)
    
    // Endpoint para obtener recomendaciones de lugares para un itinerario
    .get("/itinerario/:itinerarioId", async ({ status, params, query, store, recommendationController }) => {
        const recommended = await recommendationController.getRecommendedPlaces(
            params.itinerarioId, 
            store.user,
            query.limit
        );

        // Opción para incluir scores en respuesta
        const response = query.includeScores 
            ? recommended 
            : recommended.map(({ hybridScore, proximityScore, preferenceScore, ratingScore, ...place }) => place);

        return status(200, response);
    }, {
        params: RecommendationModel.getRecommendationParams,
        query: RecommendationModel.getRecommendationQuery
    });
