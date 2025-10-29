import { PostgresDataSource } from "../../data/PostgresDataSource";
import { Lugar } from "../../data/model";
import { CustomError } from "../../domain/CustomError";
import { LugarModel } from "./lugares.model";

export class LugarController {

    constructor(
        private lugarRepository = PostgresDataSource.getRepository(Lugar)
    ) {}

    public getAllLugares = async (): Promise<Lugar[]> => {
        
        const lugares = await this.lugarRepository.find({
            relations: ['actividades']
        });
        
        return lugares;
    }

    public getLugarById = async (id: string): Promise<Lugar> => {

        const lugar = await this.lugarRepository.findOne({
            where: { id_api_place: id },
            relations: ['actividades']
        });

        if (!lugar) {
            throw new CustomError("Lugar no encontrado", 404);
        }

        return lugar;
    }

    public createLugar = async ( data: LugarModel.RegLugarCuerpo ) : Promise<Lugar> => {
        // Verificar que el lugar no exista.
        //const existe = await this.lugarRepository.findOneBy({ id_api_place: data.id_api_place })
        //if( existe )
        //    throw new CustomError("El lugar ya está registrado", 409)

        const lugar = this.lugarRepository.create(data);
       
        await this.lugarRepository.save(lugar)
      
        return lugar
    }

    public updateLugar = async ( id: string, body: LugarModel.ModLugarCuerpo ) : Promise<Lugar> => {
        const lugar = await this.getLugarById(id);

        if( !lugar )
            throw new CustomError("Lugar no encontrado", 404);

        //Actualizar campos
        lugar.category = body.category || lugar.category;
        lugar.mexican_state = body.mexican_state || lugar.mexican_state;
        lugar.nombre = body.nombre || lugar.nombre;
        lugar.latitud = body.latitud ?? lugar.latitud; //?? permite poner 0
        lugar.longitud = body.longitud ?? lugar.longitud;
        lugar.foto_url = body.foto_url || lugar.foto_url;
        lugar.google_score = body.google_score ?? lugar.google_score;
        lugar.total_reviews = body.total_reviews ?? lugar.total_reviews;
        
        //Guardar cambios
        await this.lugarRepository.save(lugar);
        return lugar;
    }

    public deleteLugar = async ( id: string ) : Promise<Lugar> => {
        const lugar = await this.lugarRepository.findOne({ where: { id_api_place: id } });
        if( !lugar )
            throw new CustomError("Lugar no encontrado", 404);        
        await this.lugarRepository.remove(lugar);
        return lugar;
    }
}