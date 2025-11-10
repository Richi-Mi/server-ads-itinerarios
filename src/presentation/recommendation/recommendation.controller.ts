import { PostgresDataSource } from "../../data/PostgresDataSource";
import { Lugar, Usuario, Actividad, Itinerario } from "../../data/model";
import { CustomError } from "../../domain/CustomError";

interface AuthUser {
    correo: string;
}

interface ScoredLugar extends Lugar {
    hybridScore: number;
    proximityScore: number;
    preferenceScore: number;
    ratingScore: number;
}

export class RecommendationController {
    constructor(
        private lugarRepository = PostgresDataSource.getRepository(Lugar),
        private usuarioRepository = PostgresDataSource.getRepository(Usuario),
        private actividadRepository = PostgresDataSource.getRepository(Actividad),
        private itinerarioRepository = PostgresDataSource.getRepository(Itinerario)
    ) {}

    // Obtiene recomendaciones basadas en: proximidad, preferencias y calificaciones
    public getRecommendedPlaces = async (
        itinerarioId: string, 
        authUser: AuthUser, 
        limit: number = 10
    ): Promise<ScoredLugar[]> => {
        // Verifica que el itinerario exista y pertenezca al usuario
        const itinerario = await this.itinerarioRepository.findOne({
            where: { 
                id: parseInt(itinerarioId),
                owner: { correo: authUser.correo }
            },
            relations: ['actividades', 'actividades.lugar']
        });

        if (!itinerario) {
            throw new CustomError("Itinerario no encontrado", 404);
        }

        const lugaresExistentes = itinerario.actividades
            .map(act => act.lugar)
            .filter(lugar => lugar.latitud && lugar.longitud);

        const userPreferences = await this.getUserPreferences(authUser.correo);
        
        const candidatePlaces = await this.getCandidatePlaces(lugaresExistentes);
        
        // Calcula score ponderado para cada lugar
        const scoredPlaces = candidatePlaces.map(candidate => 
            this.calculateHybridScore(candidate, lugaresExistentes, userPreferences)
        );

        // Ordena por score descendente y limita resultados
        return scoredPlaces
            .sort((a, b) => b.hybridScore - a.hybridScore)
            .slice(0, limit);
    }

    private getCandidatePlaces = async (existingPlaces: Lugar[]): Promise<Lugar[]> => {
        const query = this.lugarRepository
            .createQueryBuilder("lugar")
            .where("lugar.latitud IS NOT NULL AND lugar.longitud IS NOT NULL")
            .andWhere("lugar.google_score IS NOT NULL");

        // Excluye lugares ya agregados al itinerario
        if (existingPlaces.length > 0) {
            query.andWhere("lugar.id_api_place NOT IN (:...existingIds)", {
                existingIds: existingPlaces.map(l => l.id_api_place)
            });
        }

        return query.getMany();
    }

    // Calcula score ponderado: 50% proximidad, 30% preferencias, 20% rating
    private calculateHybridScore = (
        candidate: Lugar,
        existingPlaces: Lugar[],
        userPreferences: string[]
    ): ScoredLugar => {
        
        const proximityScore = this.calculateProximityScore(candidate, existingPlaces);
        const preferenceScore = this.calculatePreferenceScore(candidate, userPreferences);
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

    // Calcula score basado en distancia a lugares existentes
    private calculateProximityScore = (candidate: Lugar, existingPlaces: Lugar[]): number => {
        if (existingPlaces.length === 0) {
            return 0.5; // Score neutral si no hay lugares de referencia
        }

        const minDistance = Math.min(
            ...existingPlaces.map(existing => 
                this.calculateDistance(
                    candidate.latitud, candidate.longitud,
                    existing.latitud, existing.longitud
                )
            )
        );

        const MAX_RELEVANT_DISTANCE = 100; // km
        return Math.max(0, 1 - (minDistance / MAX_RELEVANT_DISTANCE));
    }

    // Calcula score basado en preferencias del usuario
    private calculatePreferenceScore = (candidate: Lugar, userPreferences: string[]): number => {
        if (userPreferences.length === 0) {
            return 0.5; // Score neutral si no hay preferencias
        }

        if (userPreferences.includes(candidate.category)) {
            return 1.0;
        }

        const relatedCategories = this.getRelatedCategories(candidate.category);
        const hasRelated = relatedCategories.some(cat => userPreferences.includes(cat));
        
        return hasRelated ? 0.7 : 0.3;
    }

    // Calcula score de rating considerando calificación y número de reviews
    private calculateRatingScore = (candidate: Lugar): number => {
        if (!candidate.google_score || !candidate.total_reviews) {
            return 0.3; // Score bajo si no tiene calificación o reviews
        }

        const normalizedScore = (candidate.google_score) / 5;
        
        const confidenceFactor = this.calculateConfidenceFactor(candidate.total_reviews);
        
        // Combina score con factor de confianza
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

    private toRad = (value: number): number => {
        return value * Math.PI / 180;
    }

    // Define relaciones entre categorías para recomendaciones
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

    // Analiza historial del usuario para detectar preferencias
    private getUserPreferences = async (userEmail: string): Promise<string[]> => {
        // Obtiene todas las actividades del usuario con sus categorías
        const userActivities = await this.actividadRepository
            .createQueryBuilder("actividad")
            .leftJoinAndSelect("actividad.lugar", "lugar")
            .leftJoinAndSelect("actividad.itinerario", "itinerario")
            .leftJoinAndSelect("itinerario.owner", "owner")
            .where("owner.correo = :userEmail", { userEmail })
            .andWhere("lugar.category IS NOT NULL")
            .getMany();

        // Cuenta frecuencia de cada categoría
        const categoryCount = userActivities.reduce((acc, act) => {
            if (act.lugar?.category) {
                acc[act.lugar.category] = (acc[act.lugar.category] || 0) + 1;
            }
            return acc;
        }, {} as Record<string, number>);

        // Retorna top 5 categorías con al menos 2 visitas
        return Object.entries(categoryCount)
            .filter(([, count]) => count >= 2)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5)
            .map(([category]) => category);
    }
}
