import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from 'src/models/entities/user.entity';
import { UserRepository } from 'src/models/repositories/user.resposive';
import { RegisterDto } from 'src/modules/auth/dtos/register.dto';
import { AuthErrorMessage, saltBcrypt } from 'src/modules/auth/auth.constants';
import { LoginDto } from 'src/modules/auth/dtos/login.dto';

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

  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.userRepository.findUserByUserName(username);
    if (user && (await bcrypt.compare(password, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(loginDto: LoginDto): Promise<UserEntity> {
    const user = await this.userRepository.findUserByUserName(
      loginDto.username,
    );

    if (!user) throw new BadRequestException(AuthErrorMessage.InvalidUser);
    if (await bcrypt.compare(loginDto.password, user.password)) {
      delete user.password;
      user['access_token'] = this.jwtService.sign(user);
      return user;
    }

    throw new BadRequestException(AuthErrorMessage.InvalidUser);
  }

  async register(registerDt: RegisterDto) {
    const user = await this.userRepository.findUserByUserName(
      registerDt.username,
    );

    if (user) throw new BadRequestException(AuthErrorMessage.UserExist);
    if (registerDt.password !== registerDt.confirmPassword) {
      throw new BadRequestException(AuthErrorMessage.PasswordNotMatch);
    }

    registerDt.password = await bcrypt.hash(registerDt.password, saltBcrypt);

    return this.userRepository.save(registerDt);
  }

  // TODO
  async refreshToken() {}
}
