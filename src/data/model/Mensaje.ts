import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, type Relation } from "typeorm";
import { Usuario } from "./Usuario";

export enum estadoMensaje {
    ENVIADO, //0
    RECIBIDO, //1
    LEIDO //2
}

@Entity()
export class Mensaje {
    @PrimaryGeneratedColumn()
    id : number

    @Column()
    text : string

    @Column({type: 'timestamp'})
    horaMensaje : Date;

    @Column({
        type: "enum",
        enum: estadoMensaje
    })
    edoMensaje : estadoMensaje

    @ManyToOne(() => Usuario, usuario => usuario.mensajes, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
    emisor : Relation<Usuario>

    @ManyToOne(() => Usuario, usuario => usuario.mensajes, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
    receptor : Relation<Usuario>
}