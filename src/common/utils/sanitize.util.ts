function sanitizeString(value: string): string {
  return value.replace(/'/g, "''").trim();
}

export function sanitizeStrings<T>(value: T): T {
  if (typeof value === 'string') {
    return sanitizeString(value) as T;
  }

  if (Array.isArray(value)) {
    return value.map((item) => sanitizeStrings(item)) as T;
  }

  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, entry]) => [
        key,
        sanitizeStrings(entry),
      ]),
    ) as T;
  }

  return value;
}

export function cleanArrayValues<T>(value: T): T {
  if (Array.isArray(value)) {
    return value
      .filter((item) => item !== null && item !== undefined)
      .map((item) => cleanArrayValues(item)) as T;
  }

  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, entry]) => [
        key,
        cleanArrayValues(entry),
      ]),
    ) as T;
  }

  return value;
}
