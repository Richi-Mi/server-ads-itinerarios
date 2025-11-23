import { PostgresDataSource } from "../../data/PostgresDataSource";
import { Itinerario } from "../../data/model/Itinerario";
import { Publicacion } from "../../data/model/Publicacion";
import { Usuario } from "../../data/model/Usuario";
import { CustomError } from "../CustomError";

const publicacionRepository = PostgresDataSource.getRepository(Publicacion);
const itinerarioRepository = PostgresDataSource.getRepository(Itinerario);
const usuarioRepository = PostgresDataSource.getRepository(Usuario);

interface ShareItineraryInput {
    itinerarioId: number;
    userCorreo: string;
    descripcion: string;
    privacity_mode: boolean;
}

export class ShareItineraryUseCase {

    public async execute({ itinerarioId, userCorreo, descripcion, privacity_mode }: ShareItineraryInput): Promise<Publicacion> {
        
        const itinerario = await itinerarioRepository.findOne({
            where: { id: itinerarioId },
            relations: { owner: true } 
        });
        
        if (!itinerario) {
            throw new CustomError("Itinerario no encontrado.", 404);
        }

        if (itinerario.owner.correo !== userCorreo) {
            throw new CustomError("No autorizado. No eres el propietario de este itinerario.", 403);
        }
        const userShared = await usuarioRepository.findOneBy({ correo: userCorreo }); 
        if (!userShared) {
            throw new CustomError("Usuario no encontrado.", 404);
        }

        const existingPublicacion = await publicacionRepository.findOneBy({ 
            itinerario: { id: itinerarioId } 
        });
        
        if (existingPublicacion) {
            throw new CustomError("Este itinerario ya ha sido compartido.", 409);
        }

        const nuevaPublicacion = new Publicacion();
        nuevaPublicacion.descripcion = descripcion;
        nuevaPublicacion.privacity_mode = privacity_mode;
        nuevaPublicacion.itinerario = itinerario;
        nuevaPublicacion.user_shared = userShared;
        
        await publicacionRepository.save(nuevaPublicacion);

        if (nuevaPublicacion.itinerario && nuevaPublicacion.itinerario.owner) {
            delete (nuevaPublicacion.itinerario.owner as any).password;
        }
        if (nuevaPublicacion.user_shared) {
            delete (nuevaPublicacion.user_shared as any).password;
        }
     

        return nuevaPublicacion; 
    }
}