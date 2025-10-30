import { PostgresDataSource } from "../../data/PostgresDataSource";
import { Publicacion } from "../../data/model/Publicacion";
import { CustomError } from "../CustomError";
import { Resena } from "../../data/model/Resena";

const publicacionRepository = PostgresDataSource.getRepository(Publicacion);

export class GetPublicationAverageRatingUseCase {

    public async execute(publicationId: number): Promise<{ publicationId: number, averageRating: number, reviewCount: number }> {
        
        
        const publicacion = await publicacionRepository.findOne({
            where: { id: publicationId },
            relations: {
                reseñas: true, 
            },
        });

   
        if (!publicacion) {
            throw new CustomError("Publicación no encontrada", 404);
        }

        const reseñas = publicacion.reseñas;

        
        if (reseñas.length === 0) {
            return {
                publicationId: publicacion.id,
                averageRating: 0,
                reviewCount: 0,
            };
        }
        const totalScore = reseñas.reduce((sum: number, reseña: Resena) => sum + reseña.score, 0);
        const averageRating = totalScore / reseñas.length;


        return {
            publicationId: publicacion.id,
            averageRating: Math.round(averageRating * 10) / 10, 
            reviewCount: reseñas.length,
        };
    }
}

