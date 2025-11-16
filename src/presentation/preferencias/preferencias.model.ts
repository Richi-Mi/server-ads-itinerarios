import { t } from "elysia"; 
import { Preferencias } from "../../data/model/Preferencias";
export namespace PreferenciasModel {

    export const regisAnswer = t.Object({
        lugares_preferidos: t.Optional(t.Array(t.String())), 
        estados_visitados: t.Optional(t.Array(t.String())), 
        actividades_preferidas: t.Optional(t.Array(t.String()))
    }); 

    export type RegisAnswer = typeof regisAnswer.static; 
    
    export const getUserParams = t.Object({
        correo: t.String()
    })
}