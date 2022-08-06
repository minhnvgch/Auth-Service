import {
  Body,
  UseGuards,
  Request,
  ForbiddenException,
  Put,
} from '@nestjs/common';
import { Controller, Get, Post } from '@nestjs/common';
import { AuthService } from 'src/modules/auth/auth.service';
import { Res } from '@nestjs/common';
import { Response } from 'express';
import { UnauthorizedException } from '@nestjs/common';
import { LocalAuthGuard } from 'src/modules/auth/guards/local-auth.guard';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { Action } from 'src/modules/ability/ability.factory';
import { UserEntity } from 'src/models/entities/user.entity';
import { CheckAbilities } from 'src/modules/ability/ability.decorator';
import { AbilitiesGuard } from 'src/modules/ability/abilities.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(
    @Body('username') username: string,
    @Body('password') password: string,
  ) {
    return this.authService.register(username, password);
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req) {
    return this.authService.login(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  logout(@Res({ passthrough: true }) response: Response) {
    return {
      message: 'success',
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('refresh')
  async refreshTokens() {
    return this.authService.refreshToken();
  }

  @UseGuards(JwtAuthGuard)
  @Get('user')
  async user(@Body('userId') userId: number) {
    return await this.authService.getUserById(userId);
  }

  // TODO
  // @Put('block-user')
  // async blockUser(): Promise<UserEntity> {}
}
