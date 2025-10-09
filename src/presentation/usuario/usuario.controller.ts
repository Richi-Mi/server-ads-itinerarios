import { status } from "elysia";
import { Usuario } from "../../data/model";
import { PostgresDataSource } from "../../data/PostgresDataSource";
import { UserModel } from "./usuario.model";

export class UserController {

    constructor(
        private userRepository = PostgresDataSource.getRepository(Usuario)
    ) {}

    public doRegister = async (data : UserModel.SignUpBody ) => {
        const { password: uncrypted_password } = data
        const password = Bun.password.hashSync(uncrypted_password)
        
        // TODO: 
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