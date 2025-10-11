import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, type Relation } from "typeorm";
import { Itinerario } from "./Itinerario";
import { Usuario } from "./Usuario";
import { Resena } from "./Resena";

@Entity()
export class Publicacion {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    descripcion: string;

    @Column()
    privacity_mode : boolean;

    @OneToOne(() => Itinerario, { onDelete: 'CASCADE', onUpdate: 'CASCADE'})
    @JoinColumn()
    itinerario : Relation<Itinerario>;

    @ManyToOne(() => Usuario, user => user.publicaciones, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
    user_shared : Relation<Usuario>;

    @OneToMany(() => Resena, reseña => reseña.publicacion, { cascade: true })
    reseñas : Relation<Resena[]>
}