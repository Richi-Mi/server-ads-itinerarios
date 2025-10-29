import { PostgresDataSource } from "../../data/PostgresDataSource";

import{ Actividad, Itinerario, Lugar } from "../../data/model";

import { CustomError } from "../../domain/CustomError";

import { ActividadModel } from "./actividad.model";

interface AuthUser{
    correo: string;
    role: string;
}

export class ActividadController
{
    constructor(
        private actividadRepository = PostgresDataSource.getRepository(Actividad),
        private lugarRepository = PostgresDataSource.getRepository(Lugar),
        private itinerarioRepository = PostgresDataSource.getRepository(Itinerario),
    ) {}

    //Para ver todas las actividades de todos los itinerarios
    public getAllActividades = async( authUser: AuthUser ): Promise<Actividad[]> =>
    {
        const actividades = await this.actividadRepository.find({
            where:{
                itinerario:{
                    owner: {
                        correo: authUser.correo,
                    }
                }
            },
            relations: ['lugar', 'itinerario'],
        });

        return actividades;
    }

    //Para ver las actividades de un itinerario especifico del usuario
    public getActividadesByItinerario = async (idItinerarioURL: string, authUser: AuthUser): Promise<Actividad[]> =>
    {
        const idItinerario = parseInt(idItinerarioURL);
        if(isNaN(idItinerario))
        {
            throw new CustomError("El id del itinerario no es valido", 400);
        }

        const itinerario = await this.itinerarioRepository.findOne({
            where:{ id: idItinerario },
            relations: ['owner']
        })

        if(!itinerario)
            throw new CustomError("Itinerario no encontrado", 404);

        if( itinerario.owner.correo !== authUser.correo )
            throw new CustomError("No tienes permiso para ver este itinerario", 403);


        const actividadesItinerario = await this.actividadRepository.find({
            where:{
                itinerario:{
                    owner:{
                        correo: authUser.correo,
                    },
                    id: idItinerario,
                }
            },
            relations: ['lugar']
        });

        return actividadesItinerario;
    }

    //Para registrar una nueva actividad en un itinerario
    public createActividad = async(data: ActividadModel.RegActividadCuerpo, authUser: AuthUser): Promise<Actividad> =>
    {
        const itinerario = await this.itinerarioRepository.findOne({
            where:{ id: data.id_itinerario },
            relations: ['owner']
        });

        if(!itinerario)
            throw new CustomError("Itinerario no encontrado", 404);

        if( itinerario.owner.correo !== authUser.correo )
            throw new CustomError("No tienes permiso para agregar actividades en este itinerario", 403);

        const lugar = await this.lugarRepository.findOneBy({ id_api_place: data.id_api_place });
        if(!lugar)
            throw new CustomError("Lugar no encontrado", 404);

        const existe = await this.actividadRepository.findOne({
            where:{
                start_time: data.start_time,
                itinerario: {
                    id: data.id_itinerario,
                },
                //lugar: {
                //    id_api_place: data.id_api_place
                //}
            }
        })

        if(existe)
            throw new CustomError("Ya hay una actividad a esta hora", 409);

        const nuevaActividad = this.actividadRepository.create();

        nuevaActividad.start_time = data.start_time;
        nuevaActividad.end_time = data.end_time;
        nuevaActividad.description = data.description;
        nuevaActividad.lugar = lugar;
        nuevaActividad.itinerario = itinerario;

        await this.actividadRepository.save(nuevaActividad);

        return nuevaActividad;
    }

    //Para modificar la descripcion o fechas de inicio o fin de una actividad
    public updateActividad = async(data: ActividadModel.ModActividadCuerpo, idString: string, authUser: AuthUser): Promise<Actividad> =>
    {
        const id = parseInt(idString);
        if(isNaN(id))
            throw new CustomError("ID de actividad invalida", 400);

        const actividad = await this.actividadRepository.findOne({
            where:{ id: id },
            relations: ['itinerario', 'itinerario.owner']
        });

        if(!actividad)
            throw new CustomError("Actividad no encontrada", 404);

        if( actividad.itinerario.owner.correo !== authUser.correo )
            throw new CustomError("No tienes permiso para editar esta actividad", 403);

        actividad.description = data.description || actividad.description;
        actividad.start_time = data.start_time ?? actividad.start_time;
        actividad.end_time = data.end_time ?? actividad.end_time;

        await this.actividadRepository.save(actividad);
        return actividad;
    }

    //Para borrar una actividad
    public deleteActividad = async(idString: string, authUser: AuthUser): Promise<Actividad> =>
    {
        const id = parseInt(idString);

        if(isNaN(id))
            throw new CustomError("ID invalido", 400);

        const actividad = await this.actividadRepository.findOne({
            where: { id: id },
            relations: ['itinerario', 'itinerario.owner']
        })

        if(!actividad)
            throw new CustomError("Actividad no encontrada", 404);

        if( actividad.itinerario.owner.correo !== authUser.correo )
            throw new CustomError("No tienes permismo para eliminar esta actividad", 403);

        await this.actividadRepository.remove(actividad);
        return actividad;
    }
}