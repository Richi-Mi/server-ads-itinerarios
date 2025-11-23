import { PostgresDataSource } from "../../data/PostgresDataSource";
import { Lugar, Usuario, Actividad, Itinerario } from "../../data/model";
import { CustomError } from "../../domain/CustomError";
import { In } from "typeorm";

interface ScoredLugar extends Lugar {
    hybridScore: number;
    proximityScore: number;
    preferenceScore: number;
    ratingScore: number;
}

export class RecommendationController {
    constructor(
        private lugarRepository = PostgresDataSource.getRepository(Lugar)
    ) {}

    public getRecommendedPlacesFromList = async (
        lugarIds: string[] = [],
        query?: string,
        limit: number = 10
    ): Promise<ScoredLugar[]> => {
        
        const lugaresReferencia = await this.lugarRepository.find({
            where: { id_api_place: In(lugarIds) }
        });

        const candidatePlaces = await this.getCandidatePlacesFromList(lugaresReferencia, query);
        
        const scoredPlaces = candidatePlaces.map(candidate => 
            this.calculateHybridScoreFromList(candidate, lugaresReferencia)
        );

        return scoredPlaces
            .sort((a, b) => b.hybridScore - a.hybridScore)
            .slice(0, limit);
    }

    private getCandidatePlacesFromList = async (referenciaPlaces: Lugar[], query?: string): Promise<Lugar[]> => {
        const queryBuilder = this.lugarRepository
            .createQueryBuilder("lugar")
            .where("lugar.latitud IS NOT NULL AND lugar.longitud IS NOT NULL")
            .andWhere("lugar.google_score IS NOT NULL");

        if (referenciaPlaces.length > 0) {
            const referenciaIds = referenciaPlaces.map(l => l.id_api_place);
            queryBuilder.andWhere("lugar.id_api_place NOT IN (:...referenciaIds)", { referenciaIds });
        }

        if (query && query.trim() !== "") {
            queryBuilder.andWhere("(lugar.nombre ILIKE :query OR lugar.category ILIKE :query)", { 
                query: `%${query}%` 
            });
        }

        return queryBuilder.getMany();
    }

    private calculateHybridScoreFromList = (
        candidate: Lugar,
        referenciaPlaces: Lugar[]
    ): ScoredLugar => {
        
        const proximityScore = this.calculateProximityScore(candidate, referenciaPlaces);
        const preferenceScore = this.calculatePreferenceScoreFromList(candidate, referenciaPlaces);
        const ratingScore = this.calculateRatingScore(candidate);

        const hybridScore = (
            proximityScore * 0.5 + 
            preferenceScore * 0.3 + 
            ratingScore * 0.2
        );

        return {
            ...candidate,
            hybridScore: Number(hybridScore.toFixed(4)),
            proximityScore: Number(proximityScore.toFixed(4)),
            preferenceScore: Number(preferenceScore.toFixed(4)),
            ratingScore: Number(ratingScore.toFixed(4))
        };
    }

    private calculatePreferenceScoreFromList = (candidate: Lugar, referenciaPlaces: Lugar[]): number => {
        if (referenciaPlaces.length === 0) {
            return 0.5;
        }

        const categoriasReferencia = referenciaPlaces.map(l => l.category).filter(Boolean);

        if (categoriasReferencia.includes(candidate.category)) {
            return 1.0;
        }

        const relatedCategories = this.getRelatedCategories(candidate.category);
        const hasRelated = relatedCategories.some(cat => categoriasReferencia.includes(cat));
        
        return hasRelated ? 0.7 : 0.3;
    }

    public optimizeRoute = async (lugarIds: string[]): Promise<Lugar[]> => {
        if (lugarIds.length === 0) {
            throw new CustomError("Debe enviar al menos un lugar", 400);
        }

        const lugares = await this.lugarRepository.find({
            where: { id_api_place: In(lugarIds) }
        });

        if (lugares.length !== lugarIds.length) {
            throw new CustomError("Algunos lugares no se encontraron en la base de datos", 404);
        }

        if (lugares.length === 1) {
            return lugares; // Solo un lugar
        }

        if (lugares.length === 2) {
            return lugares; // Dos lugares (orden original)
        }

        // Para 3 o más lugares
        return this.threeOptOptimization(lugares);
    }

    private threeOptOptimization = (lugares: Lugar[]): Lugar[] => {
        let bestRoute = [...lugares];
        let bestDistance = this.calculateTotalDistance(bestRoute);
        let improved = true;

        while (improved) {
            improved = false;
            
            for (let i = 1; i < bestRoute.length - 2; i++) {
                for (let j = i + 1; j < bestRoute.length - 1; j++) {
                    for (let k = j + 1; k < bestRoute.length; k++) {
                        // Probar diferentes reconexiones
                        const newRoute = this.threeOptSwap(bestRoute, i, j, k);
                        const newDistance = this.calculateTotalDistance(newRoute);
                        
                        if (newDistance < bestDistance) {
                            bestRoute = newRoute;
                            bestDistance = newDistance;
                            improved = true;
                        }
                    }
                }
            }
        }

        return bestRoute;
    }

    private threeOptSwap = (route: Lugar[], i: number, j: number, k: number): Lugar[] => {
        const possibilities = [
            [...route],
            
            [
                ...route.slice(0, i),
                ...route.slice(i, j).reverse(),
                ...route.slice(j)
            ],
            
            [
                ...route.slice(0, i),
                ...route.slice(i, j),
                ...route.slice(j, k).reverse(),
                ...route.slice(k)
            ],
            
            [
                ...route.slice(0, i),
                ...route.slice(i, j).reverse(),
                ...route.slice(j, k).reverse(),
                ...route.slice(k)
            ]
        ];

        let bestRoute = route;
        let bestDistance = this.calculateTotalDistance(route);

        for (const possibility of possibilities) {
            const distance = this.calculateTotalDistance(possibility);
            if (distance < bestDistance) {
                bestRoute = possibility;
                bestDistance = distance;
            }
        }

        return bestRoute;
    }

    private calculateTotalDistance = (route: Lugar[]): number => {
        let total = 0;
        for (let i = 0; i < route.length - 1; i++) {
            total += this.calculateDistance(
                route[i].latitud!, route[i].longitud!,
                route[i + 1].latitud!, route[i + 1].longitud!
            );
        }
        return total;
    }

    private calculateProximityScore = (candidate: Lugar, referenciaPlaces: Lugar[]): number => {
        if (referenciaPlaces.length === 0) {
            return 0.5;
        }

        const distances = referenciaPlaces
            .filter(place => place.latitud && place.longitud)
            .map(place => this.calculateDistance(
                candidate.latitud!, candidate.longitud!,
                place.latitud!, place.longitud!
            ));

        if (distances.length === 0) return 0.5;

        const minDistance = Math.min(...distances);
        const MAX_RELEVANT_DISTANCE = 100; // km
        return Math.max(0, 1 - (minDistance / MAX_RELEVANT_DISTANCE));
    }

    private calculateRatingScore = (candidate: Lugar): number => {
        if (!candidate.google_score || !candidate.total_reviews) {
            return 0.3;
        }

        const normalizedScore = candidate.google_score / 5;
        const confidenceFactor = this.calculateConfidenceFactor(candidate.total_reviews);
        
        return normalizedScore * confidenceFactor;
    }

    private calculateConfidenceFactor = (totalReviews: number): number => {
        const factor = Math.min(1, Math.log10(totalReviews + 1) / 2);
        return factor;
    }

    private calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
        const R = 6371; // Radio de la Tierra en km
        const dLat = this.toRad(lat2 - lat1);
        const dLon = this.toRad(lon2 - lon1);
        
        const a = 
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) * 
            Math.sin(dLon/2) * Math.sin(dLon/2);
            
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    }

    private toRad = (value: number): number => value * Math.PI / 180;

    private getRelatedCategories = (category: string): string[] => {
        const categoryGroups: { [key: string]: string[] } = {
            'amusement_park': ['bowling_alley', 'movie_theater', 'stadium', 'aquarium', 'zoo'],
            'bowling_alley': ['casino', 'night_club', 'amusement_park'],
            'casino': ['night_club', 'bowling_alley', 'bar'],
            'movie_theater': ['night_club', 'bowling_alley', 'amusement_park'],
            'night_club': ['bar', 'casino', 'movie_theater'],
            'stadium': ['amusement_park', 'park', 'tourist_attraction'],
            'aquarium': ['zoo', 'amusement_park', 'park', 'tourist_attraction'],
            'campground': ['park', 'tourist_attraction'],
            'park': ['campground', 'zoo', 'aquarium', 'tourist_attraction'],
            'zoo': ['aquarium', 'amusement_park', 'park', 'tourist_attraction'],
            'art_gallery': ['museum', 'library', 'tourist_attraction'],
            'library': ['museum', 'art_gallery', 'tourist_attraction'],
            'museum': ['art_gallery', 'library', 'tourist_attraction'],
            'tourist_attraction': ['museum', 'art_gallery', 'park', 'amusement_park'],
            'bar': ['night_club', 'restaurant', 'cafe'],
            'cafe': ['restaurant', 'bar'],
            'restaurant': ['cafe', 'bar'],
            'beauty_salon': ['spa'],
            'spa': ['beauty_salon']
        };
        return categoryGroups[category] || [];
    }
}