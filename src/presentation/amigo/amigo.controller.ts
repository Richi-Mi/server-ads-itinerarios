import { Amigo, FriendRequestState } from "../../data/model";
import { Usuario } from "../../data/model";

import { PostgresDataSource } from "../../data/PostgresDataSource";
import { FileDataSource } from "../../data/FileDataSource";
import { CustomError } from "../../domain/CustomError";
import { Repository } from "typeorm";

export class AmigoController {
    constructor(
        private amigoRepository: Repository<Amigo>, 
        private userRepository:  Repository<Usuario> 
    ) {}

    async sendRequest(sender: string, receiving: string) {
        if ( sender === receiving)
            throw new CustomError("No puedes enviarte una solicitud a ti", 400); 
        const senderUser = await this.userRepository.findOne({ where: { correo: sender } }); 
        const receivingUser = await this.userRepository.findOne({ where: { correo: receiving } }); 

        if (!senderUser || !receivingUser)
            throw new CustomError("Este usuario no existe ", 404); 

        const friendRequest = await this.amigoRepository.findOne({ 
            where: { requesting_user: {correo: sender}, receiving_user: { correo: receiving} } }); 
        if ( friendRequest )
            throw new CustomError("Existe una solicitud de amistad", 400); 

        const friendship = await this.amigoRepository.findOne({
            where: [
                {
                    requesting_user: { correo: sender}, 
                    receiving_user: { correo: receiving}, 
                    status: FriendRequestState.FRIEND
                }, 
                {
                    requesting_user: { correo: receiving}, 
                    receiving_user: { correo: sender}, 
                    status: FriendRequestState.FRIEND
                }
            ]
            
        }); 
        if ( friendRequest )
            throw new CustomError("Ya eres amigo de este viajero", 400); 

        const createRequest = this.amigoRepository.create({
            requesting_user: { correo: senderUser.correo}, 
            receiving_user: { correo: receivingUser.correo }, 
            status: FriendRequestState.PENDING
        } as any); 
        
        return this.amigoRepository.save(createRequest); 
            
    }
    async respondRequest(requestId: number, action: "FRIEND" | "REJECT", user: string) {
        const req = await this.amigoRepository.findOne({
            where: { id: requestId}, 
            relations: ["receiving_user", "requesting_user"]
        });
        
        if (!req)
            throw new CustomError("No se encontro solicitud", 404); 

        if (action === "FRIEND") {
            req.status = FriendRequestState.FRIEND;
            req.fecha_amistad = new Date();
        } else {
            req.status = FriendRequestState.REJECTED;
        }
        return this.amigoRepository.save(req);

    }
    async listRequest(correo: string) {
        const listR = await this.amigoRepository.find({
            where: {
                receiving_user: { correo }, status: FriendRequestState.PENDING
            }
        });
        if(listR.length === 0)
            throw new CustomError("No tienes solicitudes de amistad", 400); 
        return listR;

    }

    async listFriend(correo: string) {
        const listF = await this.amigoRepository.find({
            where: [
                {
                    requesting_user: { correo }, 
                    status: FriendRequestState.FRIEND
                },
                {
                    receiving_user: { correo },
                     status: FriendRequestState.FRIEND
                 }
            ]
        });
        if(listF.length === 0)
            throw new CustomError("No tienes amigos aun :(", 400); 
        return listF;

    }
}