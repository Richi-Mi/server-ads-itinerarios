import { Column, Entity, OneToMany, PrimaryColumn, type Relation } from "typeorm"
import { Actividad } from "./Actividad"

// TODO : Completar esta tabla con la información que provea la API de places.
@Entity()
export class Lugar {
    @PrimaryColumn()
    id_api_place : string

    @Column()
    category : string

    @Column()
    mexican_state : string

    @OneToMany( () => Actividad, actividad => actividad.lugar, { cascade: true})
    actividades : Relation<Actividad[]>
}