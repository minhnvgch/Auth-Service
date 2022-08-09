import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GoogleRecaptchaModule } from "@nestlab/google-recaptcha";
import { IncomingMessage } from 'http';

import { AuthController } from 'src/modules/auth/auth.controller';
import { AuthService } from 'src/modules/auth/auth.service';
import { JwtStrategy } from 'src/modules/auth/strategies/jwt.strategy';
import { RefreshJwtStrategy } from "src/modules/auth/strategies/jwt-refresh-token.strategy";
import { AbilityModule } from 'src/modules/ability/ability.module';
import { UserRepository } from 'src/models/repositories/user.resposive';
import { RedisModule } from 'src/shares/redis/redis.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserRepository]),
    JwtModule,
    PassportModule,
    AbilityModule,
    GoogleRecaptchaModule.forRoot({
      secretKey: process.env.GOOGLE_RECAPTCHA_SECRET_KEY,
      response: (req: IncomingMessage) => (req.headers.recaptcha || '').toString(),
      skipIf: process.env.NODE_ENV !== 'production',
      actions: ['login'],
      score: 0.8,
    }),
    RedisModule
  ],
  providers: [AuthService, JwtStrategy, RefreshJwtStrategy],
  controllers: [AuthController],
  exports: [TypeOrmModule],
})
export class AuthModule {}
