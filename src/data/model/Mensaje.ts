import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, type Relation } from "typeorm";
import { Usuario } from "./Usuario";

@Entity()
export class Mensaje {
    @PrimaryGeneratedColumn()
    id : number

    @Column()
    text : string

    @ManyToOne(() => Usuario, usuario => usuario.mensajes, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
    emisor : Relation<Usuario>

    @ManyToOne(() => Usuario, usuario => usuario.mensajes, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
    receptor : Relation<Usuario>
}