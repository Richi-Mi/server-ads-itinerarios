import { Usuario } from "../../data/model";
import { AuthModel } from "./auth.model";

import { PostgresDataSource } from "../../data/PostgresDataSource";
import { FileDataSource } from "../../data/FileDataSource";
import { CustomError } from "../../domain/CustomError";

export class AuthController {

    constructor( 
        private userRepository = PostgresDataSource.getRepository(Usuario),
        private fileDataSource = new FileDataSource()
    ) {}

    public doRegister = async (data : AuthModel.SignUpBody ) : Promise<Usuario> => {
        const { nombre, correo, foto, password: uncrypted_password } = data
        // Hash de la contraseña
        const password = await Bun.password.hash(uncrypted_password);

        // Verificar qué el usuario no exista.
        const userExists = await this.userRepository.findOneBy({ correo })
        if( userExists )
            throw new CustomError("El correo ya está registrado", 409)

        // Creación del usuario
        const usuario = new Usuario()

        usuario.nombre = nombre
        usuario.correo = correo
        usuario.password = password

        // TODO: Crear un servicio de envío de correos para verificar el email del usuario
        
        // Si al registrarse se envió una foto, guardarla.
        if(foto) 
            usuario.foto_url = await this.fileDataSource.saveFile(foto);

        // Guardar el usuario en la base de datos.
        await this.userRepository.save(usuario);    
        
        return usuario
    }
    public doLogin = async ({ correo, password }: AuthModel.SignInBody) : Promise<Usuario> => {
        const user = await this.userRepository.findOneBy({ correo })     
        
        if( !user )
            throw new CustomError("El usuario no existe", 401)

        const isPasswordValid = await Bun.password.verify(password, user.password)

        if (!isPasswordValid)
            throw new CustomError("Contraseña incorrecta", 401)

        return user
    }
}