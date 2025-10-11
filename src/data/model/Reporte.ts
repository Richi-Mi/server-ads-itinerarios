import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, type Relation } from "typeorm";
import { Usuario } from "./Usuario";
import { History } from "./History";

@Entity()
export class Reporte { 
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    description : string

    @Column()
    entity_id : string

    @ManyToOne( () => Usuario, usuario => usuario.reportes, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
    usuario_emitente : Relation<Usuario>

    @OneToMany( () => History, history => history.reporte, { cascade: true } )
    historial : Relation<History[]>
}