import { GetPublicationAverageRatingUseCase } from "../../domain/use-cases/GetPublicationAverageRatingUseCase";
import { ShareItineraryUseCase } from "../../domain/use-cases/ShareItineraryUseCase";
// --- 1. IMPORTAR EL NUEVO CASO DE USO ---
import { GetUserPublicationsUseCase } from "../../domain/use-cases/GetUserPublicationsUseCase";
import { CustomError } from "../../domain/CustomError";

export class PublicacionController {
    
    constructor(
        private readonly getAverageRatingUseCase: GetPublicationAverageRatingUseCase = new GetPublicationAverageRatingUseCase(),
        private readonly shareItineraryUseCase: ShareItineraryUseCase = new ShareItineraryUseCase(),
        // --- 2. INYECTARLO ---
        private readonly getUserPublicationsUseCase: GetUserPublicationsUseCase = new GetUserPublicationsUseCase()
    ) {}

    public getAverageRating = async (publicationId: number) => {
        if (isNaN(publicationId) || publicationId <= 0) {
            throw new CustomError("ID de publicación no válido", 400);
        }
        return await this.getAverageRatingUseCase.execute(publicationId);
    }
    
    public shareItinerary = async (
        itinerarioId: number, 
        userCorreo: string, 
        body: { descripcion: string, privacity_mode: boolean }
    ) => {
        const { descripcion, privacity_mode } = body;
        
        if (isNaN(itinerarioId) || itinerarioId <= 0) {
            throw new CustomError("ID de itinerario no válido", 400);
        }

        return await this.shareItineraryUseCase.execute({
            itinerarioId,
            userCorreo,
            descripcion,
            privacity_mode
        });
    }

    // --- 3. NUEVO MÉTODO DEL CONTROLADOR ---
    public getMyPublications = async (userCorreo: string) => {
        return await this.getUserPublicationsUseCase.execute(userCorreo);
    }
}