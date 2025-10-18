import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, type Relation } from "typeorm";
import { Publicacion } from "./Publicacion";
import { Usuario } from "./Usuario";

@Entity()
export class Resena {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    score : number;
    
    @ManyToOne(() => Publicacion, publicacion => publicacion.reseñas, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
    publicacion : Relation<Publicacion>;

    @ManyToOne(() => Usuario, usuario => usuario.reseñas, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
    usuario : Relation<Usuario>;
}