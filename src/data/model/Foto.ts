import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, type Relation } from "typeorm";
import { Publicacion } from "./Publicacion";

@Entity()
export class Foto {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    foto_url: string;

    @ManyToOne(() => Publicacion, (publicacion) => publicacion.fotos, { onDelete: "CASCADE" })
    publicacion: Relation<Publicacion>;
}