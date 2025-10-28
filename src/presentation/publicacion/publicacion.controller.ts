
import { GetPublicationAverageRatingUseCase } from "../../domain/use-cases/GetPublicationAverageRatingUseCase";

import { CustomError } from "../../domain/CustomError";

export class PublicacionController {
    

    constructor(
        private readonly getAverageRatingUseCase: GetPublicationAverageRatingUseCase = new GetPublicationAverageRatingUseCase()
    ) {}

    
    public getAverageRating = async (publicationId: number) => {
        
    
        if (isNaN(publicationId) || publicationId <= 0) {
            throw new CustomError("ID de publicación no válido", 400);
        }

        const result = await this.getAverageRatingUseCase.execute(publicationId);
        
        return result;
    }
}

