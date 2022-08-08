import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";

@Entity('users')
export class UserEntity {
    @PrimaryGeneratedColumn()
    public id: number;

    @Column({name: "username", type: "varchar"})
    public username: string;

    @Column({name: "password", type: "varchar"})
    public password: string;

    @Column({name: "role", type: "varchar", default: "user"})
    public role: string;

    @Column({name: "email", type: "varchar", nullable: true})
    public email: string;

    @Column({name: "phonenumber", type: "varchar", nullable: true})
    public phonenumber: string;

    @Column({name: "verify_email", type: "varchar", nullable: true})
    public verify_email: string;

    @Column({name: "verify_phonenumber", type: "varchar", nullable: true})
    public verify_phonenumber: string;

    @Column({name: "last_change_password", type: "datetime", nullable: true})
    public last_change_password: Date;

    @Column({name: "type_code", type: "varchar", nullable: true})
    public type_code: string;

    @Column({name: "confirm_code", type: "varchar", nullable: true})
    public confirm_code: string;

    @Column({name: "expired_code", type: "datetime", nullable: true})
    public expired_code: Date;

    @Column({name: "status", type: "varchar", default: "unlock"})
    public status: UserStatus;

    @Column({name: "wrong_login_attemps", type: "int", default: 0})
    public wrong_login_attemps: number;

    @Column({name: "lock_time", type: "datetime", nullable: true})
    public lock_time: Date;
    
}

export enum UserStatus {
    Lock = 'lock',
    Unlock = 'unlock'
}