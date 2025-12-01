import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, type Relation } from "typeorm";
import { Usuario } from "./Usuario";

export enum FriendRequestState {
    FRIEND, //0
    PENDING, //1
    REJECTED, 
    LOCKED
}

@Entity()
export class Amigo {
    @PrimaryGeneratedColumn()
    id: number

   // @Column("date")
   // Date no siempre va a exitir 
   @Column({type: 'date', nullable: true})
    fecha_amistad: Date | null; 

    @Column({
        type: "enum",
        enum: FriendRequestState,
        default: FriendRequestState.PENDING
    })
    status : FriendRequestState
    // Amistad bidireccional A - B = B - A 
    @ManyToOne(() => Usuario, usuario => usuario.amistadesRecibidas, { onDelete: "CASCADE", onUpdate: "CASCADE" })
    @JoinColumn({ name: "receiving_user", referencedColumnName: "correo" })
    receiving_user : Relation<Usuario>

    @ManyToOne(() => Usuario, usuario => usuario.amistadesEnviadas, { onDelete: "CASCADE", onUpdate: "CASCADE" })
    @JoinColumn({ name: "requesting_user", referencedColumnName: "correo" })
    requesting_user : Relation<Usuario>
}