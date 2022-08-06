import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from 'src/models/entities/user.entity';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { UserRepository } from 'src/models/repositories/user.resposive';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRespository: UserRepository,
    private jwtService: JwtService,
  ) {}

  // Use in LocalAuthGuard
  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.findOne({ username });
    const hashedPassword = await bcrypt.hash(password, 12);
    if (user && (await bcrypt.compare(password, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  // Make a token after validate
  async login(user: any) {
    const payload = {
      id: user.id,
      username: user.username,
      is_admin: user.is_admin,
    };
    return {
      jwt: this.jwtService.sign(payload),
    };
  }

  // Sign up
  async register(username: string, password: string) {
    const hashedPassword = await bcrypt.hash(password, 12);

    const result = this.userRespository.save({
      username: username,
      password: hashedPassword,
    });

    delete (await result).password;
    return result;
  }

  async findOne(condition: any): Promise<UserEntity> {
    return this.userRespository.findOneBy(condition);
  }

  // Not handle
  async refreshToken() {}

  async deleteUser(username: string) {
    return this.userRespository.delete({ username: username });
  }
}
