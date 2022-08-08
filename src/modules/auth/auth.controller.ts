import { Body, UseGuards, Request, Headers, UsePipes, ValidationPipe } from "@nestjs/common";
import { Controller, Get, Post } from "@nestjs/common";
import { AuthService } from "src/modules/auth/auth.service";
import { JwtService } from "@nestjs/jwt";
import { Res } from "@nestjs/common";
import { response, Response } from 'express';
import { UnauthorizedException } from "@nestjs/common";
import { JwtAuthGuard } from "src/modules/auth/guards/jwt-auth.guard";
import { AbilityFactory, Action } from "src/modules/ability/ability.factory";
import { UserEntity } from "src/entities/user.entity";
import { CheckAbilities } from "src/modules/ability/ability.decorator";
import { AbilitiesGuard } from "src/modules/ability/abilities.guard";
import { RefreshJwtAuthGuard } from "src/modules/auth/guards/jwt-refresh.guard";
import { RegisterDto } from "src/modules/auth/dto/register.dto";
import { LoginDto } from "./dto/login.dto";

@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private jwtService: JwtService,
        private abilityFactory:AbilityFactory
    ) {}

    @Post('register')
    async register(
        @Body() data: RegisterDto,
    ) {
        return this.authService.register(data);
    }

    @Post('login')
    async login(
        @Body() data: LoginDto
    ) {
        return this.authService.login(data);
    }

    // Not handle
    @UseGuards(JwtAuthGuard)
    @Post('logout')
    async logout(@Res({ passthrough: true}) response: Response) {
        return {
            message: 'success'
        }
    }

    // Not handle
    @UseGuards(RefreshJwtAuthGuard)
    @Post('refresh')
    async refreshTokens () {
        return this.authService.refreshToken();
    }

    // Test Guards - Authentication
    // See some information of user
    @UseGuards(JwtAuthGuard)
    @Get('user')
    async user(
        @Body('username') username: string
    ) {
        try {
            const user = await this.authService.findOne({username});

            delete (await user).password;

            return user;
        } catch (e) {
            throw new UnauthorizedException();
        }
    }

    // Test Authorization
    // Only admin can delete users
    @UseGuards(AbilitiesGuard)
    @CheckAbilities({action: Action.Delete, subject: UserEntity})
    @UseGuards(JwtAuthGuard)
    @Post('delete-user')
    async deleteUser(
        @Body('username') username: string,
        @Res({ passthrough: true}) response: Response,
    ) {
        try {
            const user = await this.authService.findOne({username});
            if (!user) {
                return {
                    message: "User does not exist"
                }
            }
            await this.authService.deleteUser(username);
        } catch (e) {
            throw new UnauthorizedException();
        }

        return {
            message: 'success'
        }
    }
}
