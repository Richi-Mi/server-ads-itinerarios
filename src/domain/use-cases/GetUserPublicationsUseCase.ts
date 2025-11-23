import { PostgresDataSource } from "../../data/PostgresDataSource";
import { Publicacion } from "../../data/model/Publicacion";

const publicacionRepository = PostgresDataSource.getRepository(Publicacion);

export class GetUserPublicationsUseCase {

    public async execute(userCorreo: string): Promise<Publicacion[]> {
        

        const publicaciones = await publicacionRepository.find({
            where: { 
                user_shared: { correo: userCorreo } 
            },
           
            relations: {
                itinerario: true 
            },
            
            order: {
                id: "DESC"
            }
        });

        publicaciones.forEach(pub => {
            if (pub.user_shared) delete (pub.user_shared as any).password;
            if (pub.itinerario && pub.itinerario.owner) delete (pub.itinerario.owner as any).password;
        });

        return publicaciones;
    }
}