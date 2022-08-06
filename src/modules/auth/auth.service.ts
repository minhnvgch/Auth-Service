import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from 'src/models/entities/user.entity';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { UserRepository } from 'src/models/repositories/user.resposive';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserRepository)
    private readonly userRepository: UserRepository,
    private jwtService: JwtService,
  ) {}

  // TODO
  async getUserById(userId: number): Promise<UserEntity> {
    return await this.userRepository.findUserById(userId);
  }

  // Use in LocalAuthGuard
  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.userRepository.findUserByUserName(username);
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

    const result = this.userRepository.save({
      username: username,
      password: hashedPassword,
    });

    delete (await result).password;
    return result;
  }

  // TODO
  async refreshToken() {}

  async deleteUser(username: string) {
    return this.userRepository.delete({ username: username });
  }
}
