import { Like } from "typeorm";
import { PostgresDataSource } from "../../data/PostgresDataSource";
import { Lugar } from "../../data/model";
import { CustomError } from "../../domain/CustomError";
import { LugarModel } from "./lugares.model";

export class LugarController {

    constructor(
        private lugarRepository = PostgresDataSource.getRepository(Lugar)
    ) {}

    public getAllLugares = async ({ pague, limit, category, mexican_state, nombre}: LugarModel.GetLugaresQuery): Promise<Lugar[]> => {

        const whereClause: any = {};
        category && (whereClause.category = category);
        mexican_state && (whereClause.mexican_state = mexican_state);
        nombre && (whereClause.nombre = Like(`%${nombre}%`))
        
        const lugares = await this.lugarRepository.find({
            take: limit || 10,
            skip: pague ? (pague - 1) * 10 : 0,
            where: {
                ...whereClause
            },
            order: {
                google_score: "DESC"
            }
        });

        return lugares;
    }

    public getLugarById = async (id: string): Promise<Lugar> => {

        const lugar = await this.lugarRepository.findOne({
            where: { id_api_place: id }
        });

        if (!lugar) {
            throw new CustomError("Lugar no encontrado", 404);
        }

        return lugar;
    }

    public createLugar = async ( data: LugarModel.RegLugarCuerpo ) : Promise<Lugar> => {
        // Verificar que el lugar no exista.
        if(!data.id_api_place) 
            data.id_api_place = crypto.randomUUID()
        else {
            const existe = await this.lugarRepository.findOneBy({ id_api_place: data.id_api_place })
            if( existe )
                throw new CustomError("El lugar ya está registrado", 409)
        }
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
        lugar.descripcion = body.descripcion ?? lugar.descripcion;
        
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