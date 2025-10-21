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

    @Column()
    latitud : number

    @Column()
    longitud : number

    @Column()
    foto_url : string

    @Column()
    google_score : number

    @Column()
    total_reviews : number

    @OneToMany( () => Actividad, actividad => actividad.lugar, { cascade: true})
    actividades : Relation<Actividad[]>
}