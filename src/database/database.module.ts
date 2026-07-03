import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { join } from 'path';
import {
  FOURD_LAB_CONNECTION,
  FOURD_SERVICE_CONNECTION,
} from './database.constants';

const FOURD_LAB_ENTITIES = join(
  __dirname,
  '..',
  'common',
  '4DLAB',
  'entities',
  '*.entity.{ts,js}',
);

const FOURD_SERVICE_ENTITIES = join(
  __dirname,
  '..',
  'common',
  '4DSERVICE',
  'entities',
  '*.entity.{ts,js}',
);

function buildMssqlOptions(
  config: ConfigService,
  prefix: 'databases.fourDService' | 'databases.fourDLab',
  entities: string[],
): TypeOrmModuleOptions {
  return {
    type: 'mssql',
    host: config.getOrThrow<string>(`${prefix}.host`),
    port: config.getOrThrow<number>(`${prefix}.port`),
    username: config.getOrThrow<string>(`${prefix}.username`),
    password: config.getOrThrow<string>(`${prefix}.password`),
    database: config.getOrThrow<string>(`${prefix}.name`),
    options: {
      encrypt: config.get<boolean>(`${prefix}.encrypt`, false),
      trustServerCertificate: config.get<boolean>(
        `${prefix}.trustServerCertificate`,
        true,
      ),
    },
    synchronize: false,
    entities,
  };
}

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      name: FOURD_SERVICE_CONNECTION,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) =>
        buildMssqlOptions(
          config,
          'databases.fourDService',
          [FOURD_SERVICE_ENTITIES],
        ),
    }),
    TypeOrmModule.forRootAsync({
      name: FOURD_LAB_CONNECTION,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) =>
        buildMssqlOptions(config, 'databases.fourDLab', [FOURD_LAB_ENTITIES]),
    }),
  ],
})
export class DatabaseModule {}
