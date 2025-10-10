import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, type Relation } from "typeorm";
import { Usuario } from "./Usuario";

export enum FriendRequestState {
    FRIEND,
    PENDING,
    LOCKED
}

@Entity()
export class Amigo {
    @PrimaryGeneratedColumn()
    id: number

    @Column("date")
    fecha_amistad: Date

    @Column({
        type: "enum",
        enum: FriendRequestState,
        default: FriendRequestState.PENDING
    })
    status : FriendRequestState

    @ManyToOne(() => Usuario, usuario => usuario.amistades, { onDelete: "CASCADE", onUpdate: "CASCADE" })
    receiving_user : Relation<Usuario>

    @ManyToOne(() => Usuario, usuario => usuario.amistades, { onDelete: "CASCADE", onUpdate: "CASCADE" })
    requesting_user : Relation<Usuario>
}