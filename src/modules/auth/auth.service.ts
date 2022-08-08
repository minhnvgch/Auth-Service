import * as bcrypt from 'bcrypt';
import * as moment from "moment";

import { BadRequestException, HttpException, HttpStatus, Injectable, UnauthorizedException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { JwtService } from "@nestjs/jwt";
import { GoogleRecaptchaValidator } from "@nestlab/google-recaptcha/services/google-recaptcha.validator";
import { GoogleRecaptchaException } from "@nestlab/google-recaptcha";

import { RegisterDto } from "src/modules/auth/dto/register.dto";
import { LoginDto } from "src/modules/auth/dto/login.dto";
import { UserEntity, UserStatus } from "src/entities/user.entity";
import { UserRepository } from "src/repositories/user.resposive";

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(UserEntity)
        private readonly userRespository: UserRepository,
        private jwtService: JwtService,
        private readonly recaptchaValidator: GoogleRecaptchaValidator
    ){}

    // async validateInput(): Promise<void> {

    // }

    // private readonly response = {
    //     status: 'next',
    //     message: '',
    //     data: '',
    // }

    // Login service
    async login (data: LoginDto) {
        const { username, password, recaptcha } = data;
        const user = await this.findOne({username});
        
        if (!user) throw new BadRequestException("Wrong username or password!")


        if (user.status == UserStatus.Lock) {
            if ( user.lock_time > new Date()) throw new UnauthorizedException("Your account is lock. Unlock after `${user.lock_time}`");
            await this.userRespository.update(user.id, {
                status: UserStatus.Unlock
            });
        }

        if (user.wrong_login_attemps >= 5) {
            console.log("run check captcha");
            const result = await this.recaptchaValidator.validate({
                response: recaptcha,
                score: 0.8,
                action: 'login',
            });
            
            if (!result.success) throw new GoogleRecaptchaException(result.errors);
            
            throw new UnauthorizedException("Username or Password isn't correct");
        }

        if (await bcrypt.compare(password, user.password)) {

            await this.userRespository.update(user.id, 
                {wrong_login_attemps: 0}
            );

            const payload = { id: user.id, username: user.username, role: user.role};
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
        let wrong_login_attemps = user.wrong_login_attemps + 1;
        console.log("wrong_login_attemps");console.log(wrong_login_attemps);

        await this.userRespository.update(user.id, {
            wrong_login_attemps: wrong_login_attemps
        });

        if (wrong_login_attemps < 5) throw new UnauthorizedException("Username or Password isn't correct");
        
        if (wrong_login_attemps >= 10) {
            console.log("run >= 10");
            let time = (wrong_login_attemps - 10 )*5;
            let new_lock_time = moment().add(time, 'm').format('YYYY-MM-DD HH:mm:ss');

            console.log("new lock time");console.log(new_lock_time);

            await this.userRespository.update(user.id, {
                lock_time: new_lock_time,
                status: UserStatus.Lock
            });
            throw new UnauthorizedException("Your account is lock");
        }
    }

    // Sign up
    async register (data: RegisterDto) {
        const hashedPassword = await bcrypt.hash(data.password, 12);
        data.password = hashedPassword;

        const result = this.userRespository.save(data);

        delete (await result).password;
        return result;
    }

    async findOne (condition: any): Promise<UserEntity> {
        return this.userRespository.findOneBy(condition);
    }

    // Not handle
    async refreshToken () {
        return "oke";
    }

    async deleteUser (username: string) {
        return this.userRespository.delete({"username": username})
    }

}
