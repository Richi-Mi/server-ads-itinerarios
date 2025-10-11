import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, type Relation } from "typeorm";
import { Reporte } from "./Reporte";

@Entity()
export class History {
    @PrimaryGeneratedColumn()
    id : number

    @ManyToOne( () => Reporte, reporte => reporte.historial, { onDelete: 'CASCADE', onUpdate: 'CASCADE' } )
    reporte : Relation<Reporte>

    @Column()
    action_description : string
}