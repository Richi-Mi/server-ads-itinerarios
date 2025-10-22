import { Column, Entity, OneToMany, PrimaryColumn, type Relation } from "typeorm"
import { Actividad } from "./Actividad"

@Entity()
export class Lugar {
    @PrimaryColumn()
    id_api_place : string

    @Column()
    category : string

    @Column()
    mexican_state : string

    @Column()
    nombre : string

    @Column({ nullable: true })
    latitud : number

    @Column({ nullable: true})
    longitud : number

    @Column({ nullable: true })
    foto_url : string

    @Column({ nullable: true })
    google_score : number

    @Column()
    total_reviews : number

    @OneToMany( () => Actividad, actividad => actividad.lugar, { cascade: true})
    actividades : Relation<Actividad[]>
}