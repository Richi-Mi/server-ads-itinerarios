import { Column, Entity, OneToMany, PrimaryColumn, type Relation } from "typeorm";
import { Amigo } from "./Amigo";

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
    nombre : string

    @Column("varchar")
    password : string

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
}