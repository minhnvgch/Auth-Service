import { getConfig } from 'src/configs';

export interface DatabaseConfig {
  type: 'mysql';
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
  entities: string[];
  logging: boolean;
  extra: {
    connectionLimit: 100;
  };
}

export const defaultConfig = {
  ...getConfig().get<DatabaseConfig>('master'),
  autoLoadEntities: true,
};

export const masterConfig = {
  ...getConfig().get<DatabaseConfig>('master'),
  name: 'master',
  autoLoadEntities: true,
};

export const reportConfig = {
  ...getConfig().get<DatabaseConfig>('report'),
  name: 'report',
  autoLoadEntities: true,
};
