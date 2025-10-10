import fs from "fs/promises";
import path from "path";

import { Usuario } from "../../data/model";
import { UserModel } from "./usuario.model";

import { PostgresDataSource } from "../../data/PostgresDataSource";

export class UserController {

    constructor(
        private userRepository = PostgresDataSource.getRepository(Usuario)
    ) {}

    public doRegister = async (data : UserModel.SignUpBody ) : Promise<Usuario> => {
        const { nombre, correo, foto, privacity_mode, password: uncrypted_password } = data
        // Hash de la contraseña
        const password = await Bun.password.hash(uncrypted_password);

        // Creación del usuario
        const usuario = new Usuario()

        usuario.nombre = nombre
        usuario.correo = correo
        usuario.privacity_mode = privacity_mode === "true"
        usuario.password = password

        // TODO: Guardar la foto en el servidor y asignar la URL a usuario.foto_url
        // TODO: Crear un servicio de envío de correos para verificar el email del usuario
        // TODO: Crear el FileDataSource para manejar las fotos


        if( foto ) {
            try {
                // 2. Convertir el archivo a un Buffer
                // .arrayBuffer() es el método de Elysia para obtener los datos del archivo
                const buffer = Buffer.from(await foto.arrayBuffer());

                // 3. Crear un nombre de archivo único para evitar sobreescrituras
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
                const filename = `${uniqueSuffix}-${foto.name}`;

                // 4. Definir la carpeta de destino y la ruta completa del archivo
                // Usamos 'import.meta.dir' (de Bun/ESM) para obtener la ruta del directorio actual
                // const uploadDir = "/fotos"
                const uploadDir = path.join(import.meta.dir, '../../uploads/');
                const filePath = path.join(uploadDir, filename);

                // 5. Asegurarnos de que la carpeta de destino exista
                await fs.mkdir(uploadDir, { recursive: true });

                // 6. Escribir el archivo en el disco
                await fs.writeFile(filePath, buffer);

                console.log(`Foto guardada en: https://server-ads-itinerarios-production.up.railway.app/${filePath}`);

                usuario.foto_url = filePath; // Guardamos la ruta en la entidad Usuario

            } catch (error) {
                console.error("Error al guardar la foto:", error);
                throw new Error("Error al guardar la foto");
            }
        }

        await this.userRepository.save(usuario);    
        
        return usuario
    }
    public doLogin = async ({ correo, password }: UserModel.SignInBody) => {
        // TODO:
    }
    public getUserInfo = async ( correo: string ) : Promise<void> => {
        // TODO:
    }
    public deleteUser = async ( correo: string ) : Promise<void> => {
        // TODO:
    }
}