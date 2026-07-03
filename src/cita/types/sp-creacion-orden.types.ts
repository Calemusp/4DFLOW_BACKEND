export interface SpCreacionOrden4dflowRow {
  Resultado: number;
  OrdenCreada: string;
  Mensaje: string;
}

export function parseSpCreacionOrden4dflowResult(
  spResult: unknown,
): SpCreacionOrden4dflowRow | null {
  const row = (spResult as Record<string, unknown>[] | undefined)?.[0];

  if (!row || typeof row !== 'object') {
    return null;
  }

  const resultado = row.Resultado ?? row.resultado;
  const ordenCreada = row.OrdenCreada ?? row.ordenCreada;
  const mensaje = row.Mensaje ?? row.mensaje;

  if (resultado === undefined || resultado === null) {
    return null;
  }

  return {
    Resultado: Number(resultado),
    OrdenCreada: String(ordenCreada ?? ''),
    Mensaje: String(mensaje ?? ''),
  };
}
