export interface CitaEtiquetaRespuesta {
  noOrden: string;
  referenciaCita: number;
  nombre: string;
  primerApellido: string;
  segundoApellido: string;
  afiliacion: string;
  fechaNacimiento: string;
  sexo: string;
  telefono: string;
  fechaProximaCita: string;
  colegiadoMedico: string;
  nombreMedico: string;
  tipoOrden: string;
}

export interface DataEtiquetaSuccess {
  respuesta: CitaEtiquetaRespuesta;
  codigo: 'CITA_RP_200';
}

export interface DataEtiquetaConflict {
  error: true;
  statusCode: 409;
  message: string;
  codigo: 'CITA_CONVERTIDA';
}

export type DataEtiquetaResult =
  | DataEtiquetaSuccess
  | DataEtiquetaConflict
  | null;

export function isDataEtiquetaConflict(
  result: DataEtiquetaResult,
): result is DataEtiquetaConflict {
  return result !== null && 'error' in result && result.error === true;
}

export function isDataEtiquetaSuccess(
  result: DataEtiquetaResult,
): result is DataEtiquetaSuccess {
  return result !== null && 'respuesta' in result;
}
