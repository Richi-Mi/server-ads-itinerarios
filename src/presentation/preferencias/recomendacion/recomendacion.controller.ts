import { RecomendacionModel } from "./recomendacion";
import { Itinerario, Preferencias } from "../../../data/model";

import { FileDataSource } from "../../../data/FileDataSource";
import { CustomError } from "../../../domain/CustomError";
import { PostgresDataSource } from "../../../data/PostgresDataSource";

export class RecomendacionController {
    constructor(
        private prefRepository = PostgresDataSource.getRepository(Preferencias), 
        private itineRepository = PostgresDataSource.getRepository(Itinerario), 
    ){}

    public getRecomendacion = async (correo: string) : Promise<any[]> => {
        const preferencias = await this.prefRepository.findOneBy({ correo });
        
        if (!preferencias) 
            throw new CustomError("No existen preferencias del user", 404);
        
        const itinerarios = await this.itineRepository.find({
            relations: ["actividades", "actividades.lugar", "owner"],
        });

        if (!itinerarios.length) {
            throw new CustomError("No hay itinerarios", 404);
        }

        const recomendaciones = itinerarios.map((itinerario) =>{
            let score = 0; 
            // mapear itinerarios 
            const actividades = itinerario.actividades?.map(a => a.description?.toLowerCase()) || [];
            const lugares = itinerario.actividades?.map(a => a.lugar?.nombre?.toLowerCase()).filter(Boolean) || [];
            const estados = itinerario.actividades?.map(a => a.lugar?.mexican_state?.toLowerCase()).filter(Boolean) || [];

            // obtener coincidencias 
            if (preferencias.actividades_preferidas) {
                score += actividades.filter(act => 
                    preferencias.actividades_preferidas.map(a => a.toLowerCase()).includes(act)).length;
            }
            if (preferencias.lugares_preferidos) {
                score += lugares.filter(l =>
                    preferencias.lugares_preferidos.map(lp => lp.toLowerCase()).includes(l)).length;
            }
            if (preferencias.estados_visitados) {
                score += estados.filter(e =>
                    preferencias.estados_visitados.map(ev => ev.toLowerCase()).includes(e)
                ).length;
            }

            return { id: itinerario.id, title: itinerario.title, owner: itinerario.owner, actividades: itinerario.actividades, score }; 

        })
        // el mejor itinerario - debe de ser de acuerdo a las calificacion del itinerario por mientras esto: el mejor score 
        const top = recomendaciones
        .sort((a,b) => b.score - a.score)
        .slice(0,6); 

        return top;

    }
}
