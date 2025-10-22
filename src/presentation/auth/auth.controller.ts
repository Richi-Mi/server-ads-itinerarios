import { Usuario } from "../../data/model";
import { AuthModel } from "./auth.model";

import { PostgresDataSource } from "../../data/PostgresDataSource";
import { FileDataSource } from "../../data/FileDataSource";
import { EmailService } from "../../data/EmailService";
import { CustomError } from "../../domain/CustomError";

export class AuthController {

    constructor( 
        private userRepository = PostgresDataSource.getRepository(Usuario),
        private fileDataSource = FileDataSource.getInstance(),
        private emailService = EmailService.getInstance()
    ) {}

    public doRegister = async (data : AuthModel.SignUpBody ) : Promise<Usuario> => {
        const { nombre_completo, username, correo, foto, password: uncrypted_password } = data
        // Hash de la contraseña
        const password = await Bun.password.hash(uncrypted_password);

        // Verificar qué el usuario no exista.
        const userExists = await this.userRepository.findOneBy({ correo })
        if( userExists )
            throw new CustomError("El correo ya está registrado", 409)

        // Creación del usuario
        const usuario = new Usuario()

        usuario.nombre_completo = nombre_completo
        usuario.username = username
        usuario.correo = correo
        usuario.password = password
        
        // Si al registrarse se envió una foto, guardarla.
        if(foto) 
            usuario.foto_url = await this.fileDataSource.saveFile(foto);

        await Promise.all([
            this.userRepository.save(usuario),
            this.emailService.sendEmailForVerification(correo)
        ])
      
        return usuario
    }
    public doLogin = async ({ correo, password }: AuthModel.SignInBody) : Promise<Usuario> => {
        const user = await this.userRepository.findOneBy({ correo })     
        
        // Verificar que el usuario exista
        if( !user )
            throw new CustomError("El usuario no existe", 401)

        const isPasswordValid = await Bun.password.verify(password, user.password)

        // Verificar que la contraseña sea correcta
        if (!isPasswordValid)
            throw new CustomError("Contraseña incorrecta", 401)

        return user
    }
    public verifyEmail = async ( correo : string ) : Promise<[boolean, string]> => {
        const user = await this.userRepository.findOneBy({ correo })
        // Verificamos qué el usuario exista.
        if( !user )
            return [false, ""]

        // Marcamos el correo como verificado.
        user.verified_email = true

        await this.userRepository.save(user)

        return [true, user.foto_url]
    }
}