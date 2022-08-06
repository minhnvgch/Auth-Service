import { UserEntity } from 'src/models/entities/user.entity';
import { Repository, EntityRepository } from 'typeorm';

@EntityRepository(UserEntity)
export class UserRepository extends Repository<UserEntity> {
  async findUserByUserName(username: string): Promise<UserEntity> {
    return await this.findOne({
      where: {
        username,
      },
    });
  }

  async findUserById(id: number): Promise<UserEntity> {
    return await this.findOne({
      where: {
        id,
      },
    });
  }
}
