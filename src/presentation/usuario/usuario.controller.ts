import { Usuario } from "../../data/model";
import { UserModel } from "./usuario.model";

import { PostgresDataSource } from "../../data/PostgresDataSource";
import { FileDataSource } from "../../data/FileDataSource";
import { CustomError } from "../../domain/CustomError";
import { FindManyOptions, Like } from "typeorm"; // Importamos 'Like' y 'FindManyOptions'

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

        if( user.foto_url )
            await this.fileDataSource.deleteFile( user.foto_url );        
        
        await this.userRepository.remove(user);
        return user;
    }
    public updateUser = async ( correo: string, body: UserModel.UpdateUserBody ) : Promise<Usuario> => {
        const user = await this.userRepository.findOne({ where: { correo } });
        if( !user )
            throw new CustomError("Usuario no encontrado", 404);

        user.username = body.username || user.username;
        user.nombre_completo = body.nombre_completo || user.nombre_completo;
        user.privacity_mode = body.privacity_mode === "true";

        if( body.foto ) {
            if( user.foto_url )
                await this.fileDataSource.deleteFile( user.foto_url );
            
            user.foto_url = await this.fileDataSource.saveFile( body.foto );
        }
        
     
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
    /**
     * Busca viajeros (usuarios) por un término de búsqueda.
     * Solo devuelve usuarios públicos.
     * @param searchTerm El texto para buscar en 'username' y 'nombre_completo'
     */
    public searchTravelers = async (searchTerm: string | undefined): Promise<Partial<Usuario>[]> => {
        
        if (!searchTerm || searchTerm.trim() === "") {
            return [];
        }

        const searchPattern = Like(`%${searchTerm}%`);

        const options: FindManyOptions<Usuario> = {
            where: [
                { 
                    nombre_completo: searchPattern,
                    privacity_mode: false 
                },
                { 
                    username: searchPattern,
                    privacity_mode: false 
                }
            ],
            
            select: {
                username: true,
                nombre_completo: true,
                foto_url: true
            },
            
            take: 10 
        };

        const users = await this.userRepository.find(options);

        return users;
    }
    
}

