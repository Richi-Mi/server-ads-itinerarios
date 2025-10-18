import { Column, Entity, OneToMany, PrimaryColumn, type Relation } from "typeorm";
import { Amigo } from "./Amigo";
import { Itinerario } from "./Itinerario";
import { Publicacion } from "./Publicacion";
import { Resena } from "./Resena";
import { Mensaje } from "./Mensaje";
import { Reporte } from "./Reporte";

export enum UserRole {
    ADMIN = "admin",
    USER = "user",
    MODERATOR = "moderator"
}

@Entity()
export class Usuario {
    @PrimaryColumn("varchar")
    correo: string
    
    @Column("varchar")
    username : string

    @Column("varchar")
    password : string

    @Column("varchar")
    nombre_completo : string

    @Column({
        type: "varchar",
        nullable: true
    })
    foto_url : string

    @Column({
        type: "enum",
        enum: UserRole,
        default: UserRole.USER
    })
    role : UserRole

    @Column({
        type: "boolean",
        default: true
    })
    account_status : boolean    // true cuando la cuenta esta activa

    @Column({
        type: "boolean",
        default: true
    })
    privacity_mode : boolean    // true cuando el usuario no quiere que otros vean su informacion

    @Column({
        type: "boolean",
        default: false
    })
    verified_email : boolean    // true cuando el usuario ha verificado su correo

    @OneToMany(() => Amigo, amigo => amigo.receiving_user || amigo.requesting_user, { cascade: true } )
    amistades : Relation<Amigo[]>

    @OneToMany(() => Itinerario, itinerario => itinerario.owner, { cascade: true } )
    itinerarios : Relation<Itinerario[]>

    @OneToMany(() => Publicacion, publicacion => publicacion.user_shared, { cascade: true })
    publicaciones: Relation<Publicacion[]>

    @OneToMany(() => Resena, reseña => reseña.usuario, { cascade: true })
    reseñas : Relation<Resena[]>

    @OneToMany(() => Mensaje, mensaje => mensaje.emisor || mensaje.receptor, { cascade: true })
    mensajes : Relation<Mensaje[]>

    @OneToMany(() => Reporte, reporte => reporte.usuario_emitente, { cascade: true })
    reportes : Relation<Reporte[]>
}