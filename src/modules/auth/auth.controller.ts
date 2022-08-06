import { Body, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import { Controller, Get, Post } from '@nestjs/common';
import { AuthService } from 'src/modules/auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { Res } from '@nestjs/common';
import { Req } from '@nestjs/common';
import { Response } from 'express';
import { UnauthorizedException } from '@nestjs/common';
import { LocalAuthGuard } from 'src/modules/auth/guards/local-auth.guard';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { AbilityFactory, Action } from '../ability/ability.factory';
import { UserEntity } from 'src/models/entities/user.entity';
import { ForbiddenError } from '@casl/ability';
import { CheckAbilities } from '../ability/ability.decorator';
import { AbilitiesGuard } from '../ability/abilities.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private jwtService: JwtService,
    private abilityFactory: AbilityFactory,
  ) {}

  @Post('register')
  async register(
    @Body('username') username: string,
    @Body('password') password: string,
  ) {
    return this.authService.register(username, password);
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(
    @Request() req,
    // @Res({passthrough: true}) response : Response
  ) {
    return this.authService.login(req.user);

    // const jwt =  this.authService.login(username, password);
    // response.cookie('jwt', jwt, {httpOnly: true});
    // return {
    //     message: 'success'
    // };
  }

  // Not handle
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  logout(@Res({ passthrough: true }) response: Response) {
    // response.clearCookie('jwt');
    return {
      message: 'success',
    };
  }

  // Not handle
  @UseGuards(JwtAuthGuard)
  @Post('refresh')
  async refreshTokens() {
    return this.authService.refreshToken();
  }

  // Test Guards - Authentication
  // See some information of user
  @UseGuards(JwtAuthGuard)
  @Get('user')
  async user(@Body('username') username: string) {
    try {
      const user = await this.authService.findOne({ username });

      delete (await user).password;

      return user;
    } catch (e) {
      throw new UnauthorizedException();
    }
  }

  // Test Authorization
  // Only admin can delete users
  @UseGuards(AbilitiesGuard)
  @CheckAbilities({ action: Action.Delete, subject: UserEntity })
  @UseGuards(JwtAuthGuard)
  @Post('delete-user')
  async deleteUser(
    @Body('username') username: string,
    @Res({ passthrough: true }) response: Response,
  ) {
    try {
      const user = await this.authService.findOne({ username });
      if (!user) {
        return {
          message: 'User does not exist',
        };
      }
      await this.authService.deleteUser(username);
    } catch (e) {
      throw new UnauthorizedException();
    }

    return {
      message: 'success',
    };
  }
}
