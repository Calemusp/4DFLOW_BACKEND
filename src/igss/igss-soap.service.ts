import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { XMLParser } from 'fast-xml-parser';
import * as tls from 'tls';
import { hasFotografiaBase64 } from 'src/common/utils/fotografia.util';
import {
  IgssConsultaDebugResponse,
  IgssOrderError,
  IgssOrderResult,
  IgssOrderSuccess,
} from './igss.types';

const DEFAULT_TIMEOUT_MS = 20000;

@Injectable()
export class IgssSoapService {
  private readonly logger = new Logger(IgssSoapService.name);

  constructor(private readonly configService: ConfigService) {}

  
  async consultarOrdenDebug(noOrden: string): Promise<IgssConsultaDebugResponse> {
    const inicio = Date.now();
    const { rawXml, parsedSoap, igssObject } =
      await this.fetchIgssResponse(noOrden);

    return {
      noOrden,
      tiempoMs: Date.now() - inicio,
      rawXml,
      parsedSoap,
      igssObject,
      mapped: this.mapIgssObject(igssObject),
    };
  }
  

  async consultarOrden(noOrden: string): Promise<IgssOrderResult> {
    const inicio = Date.now();
    const timeoutMs = this.configService.get<number>(
      'igss.timeoutMs',
      DEFAULT_TIMEOUT_MS,
    );

    try {
      const { igssObject } = await this.fetchIgssResponse(noOrden, timeoutMs);

      this.logger.log(
        `[SOAP OK] Orden:${noOrden} Tiempo:${Date.now() - inicio}ms`,
      );

      return this.mapIgssObject(igssObject);
    } catch (error: unknown) {
      const err = error as NodeJS.ErrnoException & {
        statusCode?: number;
        message?: string;
      };

      this.logger.error('[SOAP ERROR]', {
        orden: noOrden,
        tiempoMs: Date.now() - inicio,
        error: err?.message || 'Error desconocido',
      });

      if (
        err?.code === 'TIMEOUT' ||
        err?.code === 'ECONNRESET' ||
        err?.code === 'ECONNABORTED'
      ) {
        return this.buildError(
          408,
          'El servicio Medi-IGSS tardó demasiado en responder, inténtelo nuevamente',
        );
      }

      if (err?.code === 'ECONNREFUSED' || err?.code === 'ENOTFOUND') {
        return this.buildError(
          503,
          'No fue posible conectar con el servicio Medi-IGSS, inténtelo nuevamente',
        );
      }

      if (err?.statusCode) {
        return this.buildError(
          err.statusCode,
          'El servicio Medi-IGSS devolvió un error, inténtelo nuevamente',
        );
      }

      return {
        error: true,
        source: 'API',
        code: 500,
        message: 'Error inesperado al consultar Medi-IGSS, inténtelo nuevamente',
      };
    }
  }

  private buildSoapEnvelope(noOrden: string): string {
    const usuario = this.configService.getOrThrow<string>('igss.soapUser');
    const clave = this.configService.getOrThrow<string>('igss.soapPassword');

    return `<?xml version="1.0" encoding="utf-8"?>
      <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                     xmlns:xsd="http://www.w3.org/2001/XMLSchema"
                     xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
        <soap:Body>
          <ConsultarOrden xmlns="http://tempuri.org/">
            <Usuario>${usuario}</Usuario>
            <Clave>${clave}</Clave>
            <no_orden>${noOrden}</no_orden>
          </ConsultarOrden>
        </soap:Body>
      </soap:Envelope>`;
  }

  private parseSoapResponse(rawXml: string): {
    parsedSoap: Record<string, unknown>;
    igssObject: Record<string, unknown> | null;
  } {
    const parser = new XMLParser({
      ignoreAttributes: true,
      trimValues: true,
      parseTagValue: false,
    });

    const parsedSoap = parser.parse(rawXml) as Record<string, unknown>;
    const igssObject =
      (parsedSoap?.['soap:Envelope'] as Record<string, unknown>)?.[
        'soap:Body'
      ] as Record<string, unknown> | undefined;

    const consultaResult = (
      igssObject?.ConsultarOrdenResponse as Record<string, unknown> | undefined
    )?.ConsultarOrdenResult as Record<string, unknown> | undefined;

    return {
      parsedSoap,
      igssObject:
        (consultaResult?.IGSS_CONSULTA_LABORATORIOS as
          | Record<string, unknown>
          | undefined) ?? null,
    };
  }

  private mapIgssObject(
    objeto: Record<string, unknown> | null,
  ): IgssOrderResult {
    if (!objeto || objeto.EXITO === 'FALSE') {
      return {
        error: true,
        source: 'SOAP',
        code: 404,
        message:
          (objeto?.RESPUESTA as string | undefined) ||
          'La orden de Medi-IGSS no existe',
      };
    }

    const respuesta = objeto.RESPUESTA as Record<string, unknown> | undefined;

    if (!respuesta) {
      return {
        error: true,
        source: 'SOAP',
        code: 404,
        message: 'No hay información de la cita',
      };
    }

    const paciente = respuesta.PACIENTE as Record<string, unknown> | undefined;

    if (paciente && !hasFotografiaBase64(paciente.FOTOGRAFIA as string)) {
      delete paciente.FOTOGRAFIA;
    }

    const success: IgssOrderSuccess = {
      RESPUESTA: (respuesta.PACIENTE as IgssOrderSuccess['RESPUESTA']) || null,
      SOLICITUD:
        (respuesta.SOLICITUD as IgssOrderSuccess['SOLICITUD']) || null,
      DETALLE: (respuesta.DETALLE as IgssOrderSuccess['DETALLE']) || [],
    };

    return success;
  }

  private async fetchIgssResponse(
    noOrden: string,
    timeoutMs = this.configService.get<number>(
      'igss.timeoutMs',
      DEFAULT_TIMEOUT_MS,
    ),
  ): Promise<{
    rawXml: string;
    parsedSoap: Record<string, unknown>;
    igssObject: Record<string, unknown> | null;
  }> {
    const soapXML = this.buildSoapEnvelope(noOrden);
    const rawXml = await this.tlsSOAPRequest(soapXML, timeoutMs);
    const { parsedSoap, igssObject } = this.parseSoapResponse(rawXml);

    return { rawXml, parsedSoap, igssObject };
  }

  private buildError(code: number, message: string): IgssOrderError {
    return {
      error: true,
      source: 'SOAP',
      code,
      message,
    };
  }

  private tlsSOAPRequest(soapBody: string, timeoutMs: number): Promise<string> {
    const host = this.configService.getOrThrow<string>('igss.host');
    const path = this.configService.getOrThrow<string>('igss.path');

    return new Promise((resolve, reject) => {
      const bodyBuf = Buffer.from(soapBody, 'utf-8');

      const rawRequest =
        `POST ${path} HTTP/1.1\r\n` +
        `Host: ${host}\r\n` +
        `Content-Type: text/xml; charset=utf-8\r\n` +
        `SOAPAction: "http://tempuri.org/ConsultarOrden"\r\n` +
        `Content-Length: ${bodyBuf.length}\r\n` +
        `Connection: close\r\n` +
        `\r\n`;

      const socket = tls.connect(
        { host, port: 443, servername: host },
        () => {
          socket.write(rawRequest);
          socket.write(bodyBuf.toString('binary'), 'binary');
        },
      );

      const chunks: Buffer[] = [];

      socket.on('data', (chunk: Buffer | Uint8Array) => {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
      });

      socket.on('end', () => {
        clearTimeout(timer);
        const raw = Buffer.concat(chunks);
        const sep = this.findHeaderBodySeparator(raw);

        if (sep === -1) {
          reject(new Error('Respuesta HTTP inválida del servidor IGSS'));
          return;
        }

        const headerStr = raw.slice(0, sep).toString('latin1').toLowerCase();
        let body: Buffer = raw.slice(sep + 4);

        if (headerStr.includes('transfer-encoding: chunked')) {
          body = this.dechunk(body);
        }

        resolve(body.toString('utf-8'));
      });

      socket.on('error', (err) => {
        clearTimeout(timer);
        reject(err);
      });

      const timer = setTimeout(() => {
        socket.destroy();
        reject(
          Object.assign(new Error('Tiempo de espera agotado'), {
            code: 'TIMEOUT',
          }),
        );
      }, timeoutMs);
    });
  }

  private findHeaderBodySeparator(raw: Buffer): number {
    for (let i = 0; i < raw.length - 3; i++) {
      if (
        raw[i] === 0x0d &&
        raw[i + 1] === 0x0a &&
        raw[i + 2] === 0x0d &&
        raw[i + 3] === 0x0a
      ) {
        return i;
      }
    }

    return -1;
  }

  private dechunk(buf: Buffer): Buffer {
    const parts: Buffer[] = [];
    let pos = 0;

    while (pos < buf.length) {
      const lineEnd = buf.indexOf('\r\n', pos);
      if (lineEnd === -1) break;

      const size = parseInt(
        buf.slice(pos, lineEnd).toString('ascii').split(';')[0],
        16,
      );

      if (isNaN(size) || size === 0) break;

      pos = lineEnd + 2;
      if (pos + size > buf.length) break;

      parts.push(buf.slice(pos, pos + size));
      pos += size + 2;
    }

    return Buffer.concat(parts);
  }
}
