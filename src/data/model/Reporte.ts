import { Column, Entity, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, type Relation } from "typeorm";
import { Usuario } from "./Usuario";
import { History } from "./History";
import { Publicacion } from "./Publicacion";

@Entity()
export class Reporte { 
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    description : string

    @ManyToOne(() => Publicacion, publicacion => publicacion.reportes, { onDelete: 'CASCADE', onUpdate: 'CASCADE' } )
    publicacion : Relation<Publicacion>

    @ManyToOne( () => Usuario, usuario => usuario.reportes, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
    usuario_emitente : Relation<Usuario>

    @OneToMany( () => History, history => history.reporte, { cascade: true } )
    historial : Relation<History[]>
}