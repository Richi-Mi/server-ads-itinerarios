import { PostgresDataSource } from "../../data/PostgresDataSource";
import { Itinerario, Usuario } from "../../data/model";
import { CustomError } from "../../domain/CustomError";
import { ItinerarioModel } from "./itinerario.model";

interface AuthUser{
    correo: string;
    //role: string;
}

export class ItinerarioController {
    constructor(
        private itinerarioRepository = PostgresDataSource.getRepository(Itinerario),
        private usuarioRepository = PostgresDataSource.getRepository(Usuario),
    ) {}

    public getAllItinerarios = async (authUser: AuthUser): Promise<Itinerario[]> => {
        
        const itinerarios = await this.itinerarioRepository.find({
            where:{
                owner:{
                    correo: authUser.correo
                }
            },
            relations: ['actividades']
        });
        
        return itinerarios;
    }

    public getItinerarioById = async (idString: string, authUser: AuthUser): Promise<Itinerario> => {
        const id = parseInt(idString);

        const itinerario = await this.itinerarioRepository.findOne({
            where: { id: id },
            relations: ['actividades', 'owner']
        });

        if (!itinerario) {
            throw new CustomError("Itinerario no encontrado", 404);
        }

        if( authUser.correo !== itinerario.owner.correo )
            throw new CustomError("No tienes permiso para ver este itinerario", 403);

        return itinerario;
    }

    public createItinerario = async ( data: ItinerarioModel.RegItinerarioCuerpo, authUser: AuthUser ) : Promise<Itinerario> => {
        const owner = await this.usuarioRepository.findOneBy({ correo: authUser.correo });

        if(!owner)
            throw new CustomError("Usuario no autenticado", 401);

        const nuevoItinerario = this.itinerarioRepository.create();

        nuevoItinerario.title = data.title;
        nuevoItinerario.owner = owner;
       
        await this.itinerarioRepository.save(nuevoItinerario);
      
        return nuevoItinerario
    }

    public updateItinerario = async ( idString: string, body: ItinerarioModel.ModItinerarioCuerpo, authUser: AuthUser) : Promise<Itinerario> => {
        const id = parseInt(idString);

        if(isNaN(id))
            throw new CustomError("ID invalido", 400);

        const itinerario = await this.itinerarioRepository.findOne({
            where: {id: id},
            relations: ['owner'],

        })

        if( !itinerario )
            throw new CustomError("Itinerario no encontrado", 404);

        if( itinerario.owner.correo !== authUser.correo )
            throw new CustomError("No tienes permiso para editar este itinerario", 403);

        //Actualizar campos
        itinerario.title = body.title || itinerario.title;
        
        //Guardar cambios
        await this.itinerarioRepository.save(itinerario);
        return itinerario;
    }

    public deleteItinerario = async ( idString: string, authUser: AuthUser ) : Promise<Itinerario> => {
        const id = parseInt(idString);

        if(isNaN(id))
            throw new CustomError("ID invalido", 400);

        const itinerario = await this.itinerarioRepository.findOne({
            where: { id: id },
            relations: ['owner'],
        });
        if( !itinerario )
            throw new CustomError("Itinerario no encontrado", 404);

        if( itinerario.owner.correo !== authUser.correo )
            throw new CustomError("No tienes permiso para borrar este itinerario", 403);

        await this.itinerarioRepository.remove(itinerario);
        return itinerario;
    }
}