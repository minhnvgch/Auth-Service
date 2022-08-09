import * as bcrypt from 'bcrypt';
import * as moment from "moment";

import { JwtService } from '@nestjs/jwt';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { GoogleRecaptchaValidator } from '@nestlab/google-recaptcha/services/google-recaptcha.validator';
import { GoogleRecaptchaException } from '@nestlab/google-recaptcha';

import { LoginDto } from 'src/modules/auth/dtos/login.dto';
import { UserEntity, UserStatus } from 'src/models/entities/user.entity';
import { UserRepository } from 'src/models/repositories/user.resposive';
import { RegisterDto } from 'src/modules/auth/dtos/register.dto';
import { AuthErrorMessage, saltBcrypt } from 'src/modules/auth/auth.constants';
import { RedisService } from 'src/shares/redis/redis.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserRepository)
    private readonly userRepository: UserRepository,
    private jwtService: JwtService,
    private readonly recaptchaValidator: GoogleRecaptchaValidator,
    private cacheManger: RedisService,
  ) {}

  async getUserById(userId: number): Promise<UserEntity> {
    return await this.userRepository.findUserById(userId);
  }

  async login(loginDto: LoginDto): Promise<any> {

    const user = await this.userRepository.findUserByUserName(loginDto.username);

    await this.checkUserNotLockAndExist(user);

    await this.checkCaptchaWhenWrongLoginBiggerThanFive(user, loginDto);
    
    if (await bcrypt.compare(loginDto.password, user.password)) {
      return await this.createAccessTokenAndRefreshToken(loginDto);
    }
    
    user.wrong_login_attemps++;
    await this.userRepository.update(user.id, {wrong_login_attemps: user.wrong_login_attemps});

    if (user.wrong_login_attemps < 5) throw new BadRequestException(AuthErrorMessage.InvalidUser);
    
    if (user.wrong_login_attemps >= 10) await this.LockAccountWhenWrongLoginBiggerThanTen(user.wrong_login_attemps, loginDto);

    throw new BadRequestException(AuthErrorMessage.InvalidUser);
  }

  async checkUserNotLockAndExist(user: UserEntity) {
    if (!user) throw new BadRequestException(AuthErrorMessage.InvalidUser);

    if (user.status == UserStatus.Lock) {
      if ( user.lock_time > new Date()) throw new BadRequestException(AuthErrorMessage.AccountIsLocked + user.lock_time);
      await this.userRepository.update(user.id, {
          status: UserStatus.Unlock
      });
    }
  }

  async checkCaptchaWhenWrongLoginBiggerThanFive(user: UserEntity, loginDto: LoginDto) {
    if (user.wrong_login_attemps >= 5) {
      console.log("run check captcha");
      const result = await this.recaptchaValidator.validate({
          response: loginDto.recaptcha,
          score: 0.8,
          action: 'login',
      });
      
      if (!result.success) {
        await this.userRepository.update(user.id, {
           wrong_login_attemps: user.wrong_login_attemps + 1
        });

        throw new BadRequestException(AuthErrorMessage.WrongCaptcha);
        //throw new GoogleRecaptchaException(result.errors);      
      }
    }
  }

  async createAccessTokenAndRefreshToken(loginDto: LoginDto) {
    const user = await this.userRepository.findUserByUserName(
      loginDto.username,
    );
    await this.userRepository.update(user.id, 
      {wrong_login_attemps: 0}
    );

    const payload = { id: user.id, username: user.username, role: user.role};

    await this.cacheManger.set("accesstoken"+ user.id, this.jwtService.sign(payload, {
      secret: process.env.ACCESS_TOKEN_SECRET,
      expiresIn: 60 * 15,
    }));

    await this.cacheManger.set("refreshtoken"+ user.id, this.jwtService.sign(payload, {
      secret: process.env.REFRESH_TOKEN_SECRET,
      expiresIn: 60 * 60 * 24 * 7, 
    }));

    return {
      access_token: this.jwtService.sign(payload, {
      secret: process.env.ACCESS_TOKEN_SECRET,
      expiresIn: 60 * 15,
      }),
      refresh_token: this.jwtService.sign(payload, {
      secret: process.env.REFRESH_TOKEN_SECRET,
      expiresIn: 60 * 60 * 24 * 7, 
      })
    }
  }

  async LockAccountWhenWrongLoginBiggerThanTen (wrong_login_attemps: number, loginDto: LoginDto) {
    const user = await this.userRepository.findUserByUserName(loginDto.username);
    let time = (wrong_login_attemps - 10 )*5;
        let new_lock_time = moment().add(time, 'm').format('YYYY-MM-DD HH:mm:ss');

        await this.userRepository.update(user.id, {
            lock_time: new_lock_time,
            status: UserStatus.Lock
        });
        throw new BadRequestException(AuthErrorMessage.AccountIsLocked + new_lock_time);
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

  async refreshToken(user: UserEntity) {
    const payload = { id: user.id, username: user.username, role: user.role};
    return {
      access_token: this.jwtService.sign(payload, {
        secret: process.env.ACCESS_TOKEN_SECRET,
        expiresIn: 60 * 15,
        })
    };
  }
}
