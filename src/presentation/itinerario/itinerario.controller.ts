import { PostgresDataSource } from "../../data/PostgresDataSource";
import { Actividad, Itinerario, Usuario } from "../../data/model";
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
            relations: ['actividades', 'actividades.lugar']
        });
        
        return itinerarios;
    }

    public getItinerarioById = async (idString: string, authUser: AuthUser): Promise<Itinerario> => {
        const id = parseInt(idString);

        const itinerario = await this.itinerarioRepository.findOne({
            where: { 
                id: id,
                owner: {
                    correo: authUser.correo
                }
            },
            relations: ['actividades', 'actividades.lugar']
        });

        if (!itinerario) 
            throw new CustomError("Itinerario no encontrado", 404);

        return itinerario;
    }

    public createItinerario = async ( data: ItinerarioModel.RegItinerarioCuerpo, authUser: AuthUser ) : Promise<Itinerario> => {
        const owner = await this.usuarioRepository.findOneBy({ correo: authUser.correo });

        if(!owner)
            throw new CustomError("Usuario no encontrado", 401);

        const nuevoItinerario = new Itinerario();

        nuevoItinerario.title = data.title;
        nuevoItinerario.owner = owner;

        if(!data.actividades)
            throw new CustomError("El itinerario debe tener al menos una actividad", 400);
                
        const actividades = data.actividades.map( actData => {
            const actividad = new Actividad();

                if( actData.fecha )
                    actividad.fecha = new Date(actData.fecha);
                
                actividad.description = actData.description;
                actividad.lugar = { id_api_place: actData.lugarId } as any //Asumimos que el lugar ya existe
            return actividad;
        });
        
        nuevoItinerario.actividades = actividades;
        await this.itinerarioRepository.save(nuevoItinerario);
      
        return nuevoItinerario
    }

    public updateItinerario = async ( idString: string, body: ItinerarioModel.ModItinerarioCuerpo, authUser: AuthUser) : Promise<Itinerario> => {
        const id = parseInt(idString);

        if(isNaN(id))
            throw new CustomError("ID invalido", 400);

        const itinerario = await this.itinerarioRepository.findOne({
            where: {
                id: id,
                owner: {
                    correo: authUser.correo
                }
            },
            relations: ['owner'],

        })

        if( !itinerario )
            throw new CustomError("Itinerario no encontrado", 404);

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
            where: { 
                id: id,
                owner: {
                    correo: authUser.correo
                }
            },
            relations: ['owner'],
        });
        if( !itinerario )
            throw new CustomError("Itinerario no encontrado", 404);

        if( itinerario.owner.correo !== authUser.correo )
            throw new CustomError("No tienes permiso para borrar este itinerario", 403);

        await this.itinerarioRepository.remove(itinerario);
        return itinerario;
    }

    ///filtro de itinerarios
    public buscarItinerarios = async ( buscarTerm?: string ): Promise<Itinerario[]> => {
        if( !buscarTerm || buscarTerm?.trim() === "")
            throw new CustomError("No hay terminos para buscar", 404);

           
        const term = `%${buscarTerm}%`;
        return await this.itinerarioRepository
            .createQueryBuilder("it")
            .leftJoinAndSelect("it.owner", "owner") 
            .leftJoinAndSelect("it.actividades", "act")
            .leftJoinAndSelect("act.lugar", "lugar")
            .where("it.title ILIKE :term", { term })
            .orWhere("act.description ILIKE :term", { term })
            .orWhere("lugar.nombre ILIKE :term", { term })
            .orWhere("lugar.category ILIKE :term", { term })
            //.orWhere("owner.username ILIKE :term", {term})
            .limit(6)
            .getMany(); 
    }; 
}