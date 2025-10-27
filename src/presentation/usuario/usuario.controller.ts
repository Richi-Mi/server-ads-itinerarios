import { Usuario } from "../../data/model";
import { UserModel } from "./usuario.model";

import { PostgresDataSource } from "../../data/PostgresDataSource";
import { FileDataSource }     from "../../data/FileDataSource";
import { CustomError } from "../../domain/CustomError";

export class UserController {

    constructor(
        private userRepository = PostgresDataSource.getRepository(Usuario),
        private fileDataSource = FileDataSource.getInstance()
    ) {}


    public getUserInfo = async ( correo: string ) : Promise<Usuario> => {
        // TODO: Obtener toda la información adicional 
        const user = await this.userRepository.findOne({ where: { correo } })
        if( !user )
            throw new CustomError("Usuario no encontrado", 404);
        return user;
    }
    public deleteUser = async ( correo: string ) : Promise<Usuario> => {
        const user = await this.userRepository.findOne({ where: { correo } });
        if( !user )
            throw new CustomError("Usuario no encontrado", 404);
        // Eliminar foto si existe.
        if( user.foto_url )
            await this.fileDataSource.deleteFile( user.foto_url );        
        
        await this.userRepository.remove(user);

        return user;
    }
    public updateUser = async ( correo: string, body: UserModel.UpdateUserBody ) : Promise<Usuario> => {
        const user = await this.userRepository.findOne({ where: { correo } });
        if( !user )
            throw new CustomError("Usuario no encontrado", 404);

        // Actualizar campos
        user.username = body.username || user.username;
        user.nombre_completo = body.nombre_completo || user.nombre_completo;
        user.privacity_mode = body.privacity_mode === "true";

        // Actualizar foto si se proporciona una nueva.
        if( body.foto ) {
            if( user.foto_url )
                await this.fileDataSource.deleteFile( user.foto_url );
            
            user.foto_url = await this.fileDataSource.saveFile( body.foto );
        }
        
        // Guardar cambios.
        await this.userRepository.save(user);
        return user;
    }
    public updatePassword = async ( correo: string, newPassword: string ) : Promise<void> => {
        const user = await this.userRepository.findOne({ where: { correo } });
        if( !user )
            throw new CustomError("Usuario no encontrado", 404);

        user.password = await Bun.password.hash(newPassword);
        await this.userRepository.save(user);
    }
    public verifyPassword = async ( correo: string, password: string ) : Promise<boolean> => {
        const user = await this.userRepository.findOne({ where: { correo } });
        
        if( !user )
            throw new CustomError("Usuario no encontrado", 404);
        
        return await Bun.password.verify(password, user.password);
    }
}