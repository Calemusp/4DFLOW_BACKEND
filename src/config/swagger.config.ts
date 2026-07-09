import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export function setupSwagger(app: INestApplication): void {
  const config = new DocumentBuilder()
    .setTitle('4D Patient API')
    .setDescription(
      'API del backend 4D Patient. Instancias de SQL Server: 4DSERVICE y 4DLAB. ' +
        'Incluye integración con Medi-IGSS (SOAP) para creación de citas desde órdenes de laboratorio.',
    )
    .setVersion('1.0')
    .addTag('health', 'Verificación del estado del servicio')
    .addTag('citas', 'Gestión de citas médicas')
    .addTag(
      'citas-igss',
      'Creación de citas desde órdenes IGSS (Medi-IGSS SOAP + 4DLAB)',
    )
    .addTag('create-ticket', 'Conversión de citas a órdenes y tickets')
    .addTag('auth', 'Inicio de sesión y ventanillas')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'list',
      filter: true,
      showRequestDuration: true,
    },
  });
}
