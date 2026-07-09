import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { CAT_USUARIO } from 'src/common/4DLAB/entities/cat-usuario.entity';
import { VENTANILLA } from 'src/common/4DSERVICE/entities/ventanilla.entity';
import {
  FOURD_LAB_CONNECTION,
  FOURD_SERVICE_CONNECTION,
} from 'src/database/database.constants';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectDataSource(FOURD_LAB_CONNECTION)
    private readonly fourDLabSource: DataSource,
    @InjectDataSource(FOURD_SERVICE_CONNECTION)
    private readonly fourDServiceSource: DataSource,
  ) {}

  async login({ usuario, contraseña, ventanilla }: LoginDto) {
    const ventanillaRow = await this.fourDServiceSource
      .createQueryBuilder()
      .select(['V.Ventanilla', 'V.Nombre'])
      .from(VENTANILLA, 'V')
      .where('V.Ventanilla = :ventanilla', { ventanilla })
      .andWhere('V.Vigente = 1')
      .getRawOne();

    if (!ventanillaRow) {
      throw new NotFoundException('Ventanilla no encontrada o no vigente');
    }

    const user = await this.fourDLabSource
      .createQueryBuilder()
      .select(['U.usuario', 'U.nombre'])
      .from(CAT_USUARIO, 'U')
      .where('U.usuario = :usuario', { usuario })
      .andWhere('U.password = :password', { password: contraseña })
      .andWhere('U.vigente = 1')
      .getRawOne();

    if (!user) {
      throw new UnauthorizedException('Usuario o contraseña incorrectos');
    }

    return {
      success: true,
      usuario: user.U_usuario ?? user.usuario,
      nombre: user.U_nombre ?? user.nombre,
      ventanilla,
      ventanillaNombre: ventanillaRow.V_Nombre ?? ventanillaRow.Nombre,
    };
  }

  async findVentanillas() {
    return this.fourDServiceSource
      .createQueryBuilder()
      .select(['V.Ventanilla', 'V.Nombre', 'V.Abreviatura', 'V.Color'])
      .from(VENTANILLA, 'V')
      .where('V.Vigente = 1')
      .orderBy('V.Ventanilla', 'ASC')
      .getRawMany();
  }
}
