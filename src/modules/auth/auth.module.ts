import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserEntity } from "src/entities/user.entity";
import { AuthController } from "src/modules/auth/auth.controller";
import { AuthService } from "src/modules/auth/auth.service";
import { JwtStrategy } from "src/modules/auth/strategies/jwt.strategy";
import { AbilityModule } from "src/modules/ability/ability.module";
import { RefreshJwtStrategy } from "src/modules/auth/strategies/jwt-refresh-token.strategy";
import { GoogleRecaptchaModule } from "@nestlab/google-recaptcha";
import { IncomingMessage } from "http";

@Module({
    imports: [
        TypeOrmModule.forFeature([UserEntity]),
        JwtModule,
        PassportModule, 
        AbilityModule,
        GoogleRecaptchaModule.forRoot({
            secretKey: process.env.GOOGLE_RECAPTCHA_SECRET_KEY,
            response: (req: IncomingMessage) => (req.headers.recaptcha || '').toString(),
            skipIf: process.env.NODE_ENV !== 'production',
            actions: ['login'],
            score: 0.8,
        })
    ],
    providers: [AuthService, JwtStrategy, RefreshJwtStrategy], //LocalStrategy
    controllers: [AuthController],
    exports: [TypeOrmModule]
})

export class AuthModule {}
