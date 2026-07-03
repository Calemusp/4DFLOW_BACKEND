/**
 * Script de prueba: consulta Medi-IGSS y muestra la respuesta.
 * Uso: npx ts-node -r tsconfig-paths/register scripts/test-medi-igss.ts <noOrden>
 */
import * as tls from 'tls';
import { XMLParser } from 'fast-xml-parser';

const noOrden = process.argv[2] ?? '000000000';
const HOST = process.env.IGSS_SOAP_HOST ?? 'servicios.igssgt.org';
const PATH =
  process.env.IGSS_SOAP_PATH ??
  '/WServices/WsLabMediIGSS/WsLabMediIGSS.asmx';
const USER = process.env.IGSS_SOAP_USER ?? 'WsConsultaLabs';
const PASS = process.env.IGSS_SOAP_PASSWORD ?? 'Igss.ws2020';

function dechunk(buf: Buffer): Buffer {
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
    parts.push(buf.subarray(pos, pos + size));
    pos += size + 2;
  }
  return Buffer.from(Buffer.concat(parts));
}

function tlsSOAPRequest(soapBody: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const bodyBuf = Buffer.from(soapBody, 'utf-8');
    const rawRequest =
      `POST ${PATH} HTTP/1.1\r\n` +
      `Host: ${HOST}\r\n` +
      `Content-Type: text/xml; charset=utf-8\r\n` +
      `SOAPAction: "http://tempuri.org/ConsultarOrden"\r\n` +
      `Content-Length: ${bodyBuf.length}\r\n` +
      `Connection: close\r\n\r\n`;

    const socket = tls.connect({ host: HOST, port: 443, servername: HOST }, () => {
      socket.write(rawRequest);
      socket.write(bodyBuf.toString('binary'), 'binary');
    });

    const chunks: Buffer[] = [];
    socket.on('data', (c) => chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(c)));
    socket.on('end', () => {
      const raw = Buffer.concat(chunks);
      let sep = -1;
      for (let i = 0; i < raw.length - 3; i++) {
        if (raw[i] === 0x0d && raw[i + 1] === 0x0a && raw[i + 2] === 0x0d && raw[i + 3] === 0x0a) {
          sep = i;
          break;
        }
      }
      if (sep === -1) return reject(new Error('HTTP inválido'));
      const headerStr = raw.slice(0, sep).toString('latin1').toLowerCase();
      let body: Buffer = raw.subarray(sep + 4);
      if (headerStr.includes('transfer-encoding: chunked')) {
        body = Buffer.from(dechunk(body));
      }
      resolve(body.toString('utf-8'));
    });
    socket.on('error', reject);
    setTimeout(() => {
      socket.destroy();
      reject(new Error('TIMEOUT'));
    }, 20000);
  });
}

async function main() {
  const soapXML = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <ConsultarOrden xmlns="http://tempuri.org/">
      <Usuario>${USER}</Usuario>
      <Clave>${PASS}</Clave>
      <no_orden>${noOrden}</no_orden>
    </ConsultarOrden>
  </soap:Body>
</soap:Envelope>`;

  console.log(`Consultando orden: ${noOrden}\n`);
  const rawXml = await tlsSOAPRequest(soapXML);
  const parser = new XMLParser({ ignoreAttributes: true, trimValues: true, parseTagValue: false });
  const parsed = parser.parse(rawXml);
  const igss =
    parsed?.['soap:Envelope']?.['soap:Body']?.ConsultarOrdenResponse
      ?.ConsultarOrdenResult?.IGSS_CONSULTA_LABORATORIOS;

  console.log('=== XML CRUDO (primeros 2000 chars) ===');
  console.log(rawXml.slice(0, 2000));
  console.log('\n=== IGSS_CONSULTA_LABORATORIOS ===');
  console.log(JSON.stringify(igss, null, 2));
}

main().catch((e) => {
  console.error('Error:', e.message);
  process.exit(1);
});
