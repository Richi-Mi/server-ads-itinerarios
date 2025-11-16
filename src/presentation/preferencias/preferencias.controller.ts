import { Preferencias, Usuario } from "../../data/model";
import { PreferenciasModel } from "./preferencias.model";

import { PostgresDataSource } from "../../data/PostgresDataSource";
import { CustomError } from "../../domain/CustomError";

export class PreferenciasController {
    constructor(
        private preferenciaRepository = PostgresDataSource.getRepository(Preferencias), 
        private userRepository = PostgresDataSource.getRepository(Usuario)
    ){}

    public registerAnswer = async ( data: PreferenciasModel.RegisAnswer, user: any): Promise<Preferencias> => {
        const correo = user.correo; 
        if (!correo) 
            throw new CustomError("No se puede obtener el token", 401);

        const userExists = await this.userRepository.findOne({ where: { correo }}); 

        if(!userExists)
            throw new CustomError("El correo no esta la base de datos", 404); 

    const preferencias = this.preferenciaRepository.create({
       //correo, 
       usuario: userExists, 
       lugares_preferidos: data.lugares_preferidos ?? [],
       estados_visitados: data.estados_visitados ?? [],
       actividades_preferidas: data.actividades_preferidas ?? []
    }); 

    await this.preferenciaRepository.save(preferencias)
    return preferencias; 

    }; 

    public getAnswerUser = async ( correo: string): Promise<Preferencias[]> => {
        const answerUser = await this.preferenciaRepository.find({ where: { correo } }); 

        if (answerUser.length === 0)
            throw new CustomError("El usuario no tiene respuestas", 404);

        return answerUser;
    }; 

    public getAllAnswers = async (): Promise<Preferencias[]> => {
        const all = await this.preferenciaRepository.find(); 
        if( all.length === 0)
            throw new CustomError("No hay respuestas registradas", 404); 
        return all; 
    }; 

}



