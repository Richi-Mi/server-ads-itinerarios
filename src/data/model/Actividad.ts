import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, type Relation } from "typeorm";
import { Lugar } from "./Lugar";
import { Itinerario } from "./Itinerario";

@Entity()
export class Actividad {
    @PrimaryGeneratedColumn()
    id : number;

    @Column()
    start_time : Date;

    @Column()
    end_time : Date;

    @Column()
    description : string;

    @ManyToOne(() => Lugar, lugar => lugar.actividades, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
    lugar : Relation<Lugar>;

    @ManyToOne( () => Itinerario, (itinerario) => itinerario.actividades, { onDelete: 'CASCADE', onUpdate: 'CASCADE'})
    itinerario : Relation<Itinerario>;
}