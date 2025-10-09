import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
class Usuario {
    @PrimaryGeneratedColumn()
    id: number
    
    @Column("varchar")
    nombre : string
}

export {
    Usuario
}