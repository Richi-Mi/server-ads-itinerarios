import { Usuario } from "../../data/model";
import { UserModel } from "./usuario.model";

import { PostgresDataSource } from "../../data/PostgresDataSource";
import { FileDataSource }     from "../../data/FileDataSource";
import { CustomError } from "../../domain/CustomError";

export class UserController {

    constructor(
        private userRepository = PostgresDataSource.getRepository(Usuario),
        private fileDataSource = new FileDataSource()
    ) {}


    public getUserInfo = async ( correo: string ) : Promise<void> => {
        // TODO:
    }
    public deleteUser = async ( correo: string ) : Promise<void> => {
        // TODO:
    }
}