import * as dotenv from 'dotenv';
import { UserEntity } from 'src/entities/user.entity';
import { DataSourceOptions } from 'typeorm';
dotenv.config();

export const config: DataSourceOptions = {
    type: 'mysql',
    host: process.env.TYPEORM_HOST,
    port: Number(process.env.TYPEORM_PORT),
    username: process.env.TYPEORM_USERNAME,
    password: process.env.TYPEORM_PASSWORD,
    database: process.env.TYPEORM_DATABASE,
    entities: [UserEntity],
    synchronize: true,
  }