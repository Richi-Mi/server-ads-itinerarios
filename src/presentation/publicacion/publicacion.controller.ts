import { GetPublicationAverageRatingUseCase } from "../../domain/use-cases/GetPublicationAverageRatingUseCase";
import { ShareItineraryUseCase } from "../../domain/use-cases/ShareItineraryUseCase";
import { GetUserPublicationsUseCase } from "../../domain/use-cases/GetUserPublicationsUseCase";
import { CustomError } from "../../domain/CustomError";
import { PublicacionModel } from "./publicacion.model";
import { FileDataSource } from "../../data/FileDataSource";
import { PostgresDataSource } from "../../data/PostgresDataSource";
import { Foto } from "../../data/model/Foto";
import { Publicacion } from "../../data/model";

export class PublicacionController {
    
    constructor(
        private readonly getAverageRatingUseCase: GetPublicationAverageRatingUseCase = new GetPublicationAverageRatingUseCase(),
        private readonly shareItineraryUseCase: ShareItineraryUseCase = new ShareItineraryUseCase(),
        private readonly getUserPublicationsUseCase: GetUserPublicationsUseCase = new GetUserPublicationsUseCase(),
        private readonly fileDataSource = FileDataSource.getInstance("development"), 
        private readonly fotoRepository = PostgresDataSource.getRepository(Foto),
        private readonly publicacionRepository = PostgresDataSource.getRepository(Publicacion)
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
        const publicaciones = await this.publicacionRepository.find({
            where: { user_shared: { correo: userCorreo } },
            relations: ['itinerario', 'fotos', 'user_shared', 'reseñas', 'reseñas.usuario'],
            order: { id: 'DESC' }
        });

        return publicaciones;
    }

    public deletePublication = async (publicationId: number, userCorreo: string) => {
        const publicacion = await this.publicacionRepository.findOne({
            where: { id: publicationId },
            relations: ['user_shared']
        });

        if (!publicacion) {
            throw new CustomError("Publicación no encontrada", 404);
        }

        if (publicacion.user_shared.correo !== userCorreo) {
            throw new CustomError("No tienes permiso para borrar esta publicación", 403);
        }

        await this.publicacionRepository.remove(publicacion);
        return { message: "Publicación eliminada correctamente" };
    }

    public getPublicationWithResenas = async (publicationId: number, authUserCorreo?: string) => {
        const publicacion = await this.publicacionRepository.findOne({
            where: { id: publicationId },
            relations: [
                'itinerario', 
                'fotos', 
                'user_shared',
                'reseñas', 
                'reseñas.usuario'
            ]
        });

        if (!publicacion) {
            throw new CustomError("Publicación no encontrada", 404);
        }

        let canAccess = false;
        
        if (publicacion.privacity_mode === false) {
            canAccess = true;
        } else if (authUserCorreo) {
            canAccess = publicacion.user_shared.correo === authUserCorreo;
        } else {
            canAccess = false;
        }

        if (!canAccess) {
            throw new CustomError("No tienes acceso a esta publicación", 403);
        }

        const response = {
            id: publicacion.id,
            descripcion: publicacion.descripcion,
            privacity_mode: publicacion.privacity_mode,
            itinerario: publicacion.itinerario ? {
                id: publicacion.itinerario.id,
                title: publicacion.itinerario.title
            } : null,
            user_shared: {
                username: publicacion.user_shared.username,
                nombre_completo: publicacion.user_shared.nombre_completo,
                foto_url: publicacion.user_shared.foto_url,
                correo: publicacion.user_shared.correo
            },
            fotos: publicacion.fotos ? publicacion.fotos.map(foto => ({
                id: foto.id,
                foto_url: foto.foto_url
            })) : [],
            reseñas: publicacion.reseñas ? publicacion.reseñas.map(resena => ({
                id: resena.id,
                score: resena.score,
                commentario: resena.commentario,
                usuario: {
                    username: resena.usuario.username,
                    nombre_completo: resena.usuario.nombre_completo,
                    foto_url: resena.usuario.foto_url
                }
            })) : []
        };

        return response;
    }
}