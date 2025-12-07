import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, type Relation } from "typeorm";
import { Itinerario } from "./Itinerario";
import { Usuario } from "./Usuario";
import { Resena } from "./Resena";
import { Foto } from "./Foto";
import { Reporte } from "./Reporte";

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

    @OneToMany(() => Foto, foto => foto.publicacion, { cascade: true })
    fotos : Relation<Foto[]>

    @OneToMany(() => Reporte, reporte => reporte.publicacion)
    reportes : Relation<Reporte[]>
}