import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, type Relation } from "typeorm";
import { Usuario } from "./Usuario";
import { Actividad } from "./Actividad";

@Entity()
export class Itinerario {
    @PrimaryGeneratedColumn()
    id : number;

    @Column()
    title : string;

    @ManyToOne(() => Usuario, (usuario) => usuario.itinerarios, { onDelete: 'CASCADE', onUpdate: 'CASCADE'})
    owner : Relation<Usuario>;

    @OneToMany(() => Actividad, actividad => actividad.itinerario, { cascade: true })
    actividades : Relation<Actividad[]>
}