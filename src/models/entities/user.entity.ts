import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";

@Entity('users')
export class UserEntity {
    @PrimaryGeneratedColumn()
    public id: number;

    @Column({name: "username", type: "varchar"})
    public username: string;

    @Column({name: "password", type: "varchar"})
    public password: string;

    @Column({name: "is_admin", type: "varchar", default: "false"})
    public is_admin: string;

    // @Column({name: "is_active", type: "boolean"})
    // public isActive: boolean;
    
    // @Column({name: "number_login_fall", type: "int"})
    // public number_login_fall: int;
}