const DATA_URI_PREFIX = /^data:image\/\w+;base64,/;

export function stripBase64DataUriPrefix(base64: string): string {
  return base64.replace(DATA_URI_PREFIX, '').trim();
}

export function hasFotografiaBase64(
  value: string | null | undefined,
): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

/**
 * Convierte la fotografía Base64 del SOAP IGSS a Buffer para columnas varbinary.
 */
export function base64FotografiaToBuffer(
  base64: string | null | undefined,
): Buffer | null {
  if (!hasFotografiaBase64(base64)) {
    return null;
  }

  const normalized = stripBase64DataUriPrefix(base64);
  return Buffer.from(normalized, 'base64');
}
