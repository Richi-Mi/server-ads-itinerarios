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

    private friend(correoA: string, correoB?: string) {
        if(correoB) {
            return [
                {
                    requesting_user: { correo: correoA },
                    receiving_user: { correo: correoB },
                    status: FriendRequestState.FRIEND 
                }, 
                {
                    requesting_user: { correo: correoB },
                    receiving_user: { correo: correoA },
                    status: FriendRequestState.FRIEND
                }
            ]; 
        }
        return [
            {
                requesting_user: { correo: correoA },
                status: FriendRequestState.FRIEND
            },
            {
                receiving_user: { correo: correoA },
                status: FriendRequestState.FRIEND

            }
        ]; 
    }

    async sendRequest(sender: string, receiving: string) {
        if ( sender === receiving)
            throw new CustomError("No puedes enviarte una solicitud a ti", 400); 

        const senderUser = await this.userRepository.findOne({ where: [ { correo: sender }, { username: sender } ]}); 
        const receivingUser = await this.userRepository.findOne({ where: [ { correo: receiving }, { username : receiving } ] }); 

        if (!senderUser || !receivingUser)
            throw new CustomError("Este usuario no existe ", 404); 

        const friendRequest = await this.amigoRepository.findOne({ 
            where: { 
                requesting_user: { username: senderUser.username },
                receiving_user: { username: receivingUser.username }
            } 
        }); 

        if ( friendRequest )
            throw new CustomError("Ya existe una solicitud de amistad", 400); 

        const friendship = await this.amigoRepository.findOne({
            where: this.friend(senderUser.correo, receivingUser.correo)
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
            where: this.friend(correo), 
            relations: ["requesting_user", "receiving_user"]
        });
        if(listF.length === 0)
            throw new CustomError("No tienes amigos aun :(", 400); 
        return listF;
    }
    
    async  searchFriend(correo: string, query: string ) {
        const listF = await this.amigoRepository.find({
            where: this.friend(correo), 
            relations: ["requesting_user", "receiving_user"]
        }); 

        const list = listF.map(a =>
        a.requesting_user.correo === correo
            ? a.receiving_user
            : a.requesting_user
        );

        const q = query.toLowerCase(); 
       
        return list.filter(u =>
            u.username.toLowerCase().includes(q)
        );

    }

    async removeFriend(user: string, friend: string ) {

        const relation = await this.amigoRepository.findOne({
            where: this.friend(user, friend)
        });

        if(!relation)
            throw new CustomError("Ya no son amigos ", 404); 

        return this.amigoRepository.remove(relation); 
    }
}