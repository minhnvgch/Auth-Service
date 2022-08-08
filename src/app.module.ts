import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/modules/auth/auth.module';
import { config } from 'src/ormconfig';

@Module({
  imports: [
    TypeOrmModule.forRoot(config),
    AuthModule,
  ],
  controllers: [],
  providers: [],
})

export class AppModule {}
