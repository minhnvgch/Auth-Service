import { UserEntity } from "src/entities/user.entity";
import { Repository, getRepository, EntityRepository } from "typeorm";

@EntityRepository(UserEntity)
export class UserRepository extends Repository<UserEntity> {
}