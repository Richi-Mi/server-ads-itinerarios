import { GetPublicationAverageRatingUseCase } from "../../domain/use-cases/GetPublicationAverageRatingUseCase";
import { ShareItineraryUseCase } from "../../domain/use-cases/ShareItineraryUseCase";
import { CustomError } from "../../domain/CustomError";

export class PublicacionController {
  constructor(
    private readonly getAverageRatingUseCase: GetPublicationAverageRatingUseCase = new GetPublicationAverageRatingUseCase(),
    private readonly shareItineraryUseCase: ShareItineraryUseCase = new ShareItineraryUseCase()
  ) {}

  public getAverageRating = async (publicationId: number) => {
    if (isNaN(publicationId) || publicationId <= 0) {
      throw new CustomError("ID de publicación no válido", 400);
    }
    return await this.getAverageRatingUseCase.execute(publicationId);
  };
  public shareItinerary = async (
    itinerarioId: number,
    userCorreo: string,
    body: { descripcion: string; privacity_mode: boolean }
  ) => {
    const { descripcion, privacity_mode } = body;
    if (isNaN(itinerarioId) || itinerarioId <= 0) {
      throw new CustomError("ID de itinerario no válido", 400);
    }

    const nuevaPublicacion = await this.shareItineraryUseCase.execute({
      itinerarioId,
      userCorreo,
      descripcion,
      privacity_mode,
    });

    return nuevaPublicacion;
  };
}
