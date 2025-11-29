import { Amigo, FriendRequestState } from "../../data/model";
import { Usuario } from "../../data/model";

import { PostgresDataSource } from "../../data/PostgresDataSource";
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

        const senderUser = await this.userRepository.findOne({ where: [ { correo: sender }, { username: sender } ]}); 
        const receivingUser = await this.userRepository.findOne({ where: [ { correo: receiving }, { username : receiving } ] }); 

        if (!senderUser || !receivingUser)
            throw new CustomError("Este usuario no existe ", 404); 

        const friendRequest = await this.amigoRepository.findOne({ 
            where: { requesting_user: {correo: sender}, receiving_user: { correo: receiving} } }); 

        if ( friendRequest )
            throw new CustomError("Ya existe una solicitud de amistad", 400); 

        const friendship = await this.amigoRepository.findOne({
            where: [
                {
                    requesting_user: { correo: senderUser.username }, 
                    receiving_user: { correo: receivingUser.username }, 
                    status: FriendRequestState.FRIEND
                }, 
                {
                    requesting_user: { correo: receivingUser.username}, 
                    receiving_user: { correo: senderUser.username}, 
                    status: FriendRequestState.FRIEND
                }
            ]
            
        }); 
        if ( friendship )
            throw new CustomError("Ya eres amigo de este viajero", 400); 

        const createRequest = this.amigoRepository.create({
            requesting_user: { correo: senderUser.correo}, 
            receiving_user: { correo: receivingUser.correo }, 
            status: FriendRequestState.PENDING
        }); 
        
        const save = await this.amigoRepository.save(createRequest); 

        return this.amigoRepository.findOne({ where: { id: save.id }, relations: { requesting_user : true, receiving_user: true } }); 
            
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
            ], 
            relations: ["requesting_user", "receiving_user"]
        });
        if(listF.length === 0)
            throw new CustomError("No tienes amigos aun :(", 400); 
        return listF;
    }
}