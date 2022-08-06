import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from 'src/modules/auth/auth.controller';
import { AuthService } from 'src/modules/auth/auth.service';
import { jwtConstants } from 'src/modules/auth/auth.constants';
import { JwtStrategy } from 'src/modules/auth/strategies/jwt.strategy';
import { LocalStrategy } from 'src/modules/auth/strategies/local.strategy';
import { AbilityModule } from 'src/modules/ability/ability.module';
import { UserRepository } from 'src/models/repositories/user.resposive';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserRepository]),
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: {
        expiresIn: '1h',
      },
    }),
    PassportModule,
    AbilityModule,
  ],
  providers: [AuthService, LocalStrategy, JwtStrategy],
  controllers: [AuthController],
  exports: [TypeOrmModule],
})
export class AuthModule {}
