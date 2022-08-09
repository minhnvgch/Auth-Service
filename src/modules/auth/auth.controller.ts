import {Body,UseGuards,Request,ForbiddenException,Put, Res,Controller, Get, Post} from '@nestjs/common';
import { Response } from 'express';

import { AuthService } from 'src/modules/auth/auth.service';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { Action } from 'src/modules/ability/ability.factory';
import { CheckAbilities } from 'src/modules/ability/ability.decorator';
import { AbilitiesGuard } from 'src/modules/ability/abilities.guard';
import { RegisterDto } from 'src/modules/auth/dtos/register.dto';
import { LoginDto } from 'src/modules/auth/dtos/login.dto';
import { RefreshJwtAuthGuard } from 'src/modules/auth/guards/jwt-refresh.guard';
import { UserEntity } from 'src/models/entities/user.entity';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  logout(@Res({ passthrough: true }) response: Response) {
    return {
      message: 'success',
    };
  }

  @UseGuards(RefreshJwtAuthGuard)
  @Get('refresh')
  async refreshTokens(@Request() req) {
    return this.authService.refreshToken(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('user')
  async user(@Body('userId') userId: number) {
    return await this.authService.getUserById(userId);
  }

  // Test Authorization
    // Only admin can delete users
    @UseGuards(AbilitiesGuard)
    @CheckAbilities({action: Action.Delete, subject: UserEntity})
    @UseGuards(JwtAuthGuard)
    @Post('delete-user')
    async deleteUser(
        @Body('userId') userId: number,
        @Res({ passthrough: true}) response: Response,
    ) {
      return this.authService.deleteUser(userId);
    }
}
