import { GetPublicationAverageRatingUseCase } from "../../domain/use-cases/GetPublicationAverageRatingUseCase";
import { ShareItineraryUseCase } from "../../domain/use-cases/ShareItineraryUseCase";
import { GetUserPublicationsUseCase } from "../../domain/use-cases/GetUserPublicationsUseCase";
import { CustomError } from "../../domain/CustomError";
import { PublicacionModel } from "./publicacion.model";
import { FileDataSource } from "../../data/FileDataSource";
import { PostgresDataSource } from "../../data/PostgresDataSource";
import { Foto } from "../../data/model/Foto";

export class PublicacionController {
    
    constructor(
        private readonly getAverageRatingUseCase: GetPublicationAverageRatingUseCase = new GetPublicationAverageRatingUseCase(),
        private readonly shareItineraryUseCase: ShareItineraryUseCase = new ShareItineraryUseCase(),
        private readonly getUserPublicationsUseCase: GetUserPublicationsUseCase = new GetUserPublicationsUseCase(),
        private readonly fileDataSource = FileDataSource.getInstance("development"), 
        private readonly fotoRepository = PostgresDataSource.getRepository(Foto)
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
        body: PublicacionModel.ShareBody
    ) => {
        const { descripcion, privacity_mode, fotos } = body;
        
        if (isNaN(itinerarioId) || itinerarioId <= 0) {
            throw new CustomError("ID de itinerario no válido", 400);
        }
       
        const [publication, fileUrls] = await Promise.all([
            this.shareItineraryUseCase.execute({
                itinerarioId,
                userCorreo,
                descripcion,
                privacity_mode: privacity_mode === "true" ? true : false
            }),
            this.fileDataSource.saveFiles(fotos || [])
        ])
        
        for (let i = 0; i < fileUrls.length; i++) {
            const foto = new Foto();
            foto.foto_url = fileUrls[i];
            foto.publicacion = publication;
            await this.fotoRepository.save(foto);
        }

        return { ...publication, fotos: fileUrls };
         
    }
    public getMyPublications = async (userCorreo: string) => {
        return await this.getUserPublicationsUseCase.execute(userCorreo);
    }
}