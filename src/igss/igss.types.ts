export interface IgssPatient {
  NUMERO_AFILIADO?: string;
  NOMBRES?: string;
  PRIMER_APELLIDO?: string;
  SEGUNDO_APELLIDO?: string;
  SEXO_AFILIADO?: string;
  FECHA_NACIMIENTO?: string;
  TIPO_DERECHOHABIENTE?: string;
  COD_PROGRAMA?: string;
  TELEFONO?: string;
  FOTOGRAFIA?: string;
  [key: string]: unknown;
}

export interface IgssRequest {
  CODIGO_SERVICIO?: string;
  COLEGIADO_MEDICO?: string;
  NOMBRE_MEDICO?: string;
  [key: string]: unknown;
}

export interface IgssExamDetail {
  CODIGO_EXAMEN?: string;
  [key: string]: unknown;
}

export interface IgssOrderSuccess {
  RESPUESTA: IgssPatient | null;
  SOLICITUD: IgssRequest | null;
  DETALLE: IgssExamDetail[];
}

export interface IgssOrderError {
  error: true;
  source: 'SOAP' | 'API';
  code: number;
  message: string;
}

export type IgssOrderResult = IgssOrderSuccess | IgssOrderError;

export function isIgssOrderError(
  result: IgssOrderResult,
): result is IgssOrderError {
  return 'error' in result && result.error === true;
}

export interface IgssConsultaDebugResponse {
  noOrden: string;
  tiempoMs: number;
  rawXml: string;
  parsedSoap: Record<string, unknown>;
  igssObject: Record<string, unknown> | null;
  mapped: IgssOrderResult;
}
