/** True when Postgres refused the write because of a unique constraint (23505). */
export function isUniqueViolation(error: unknown): boolean {
  // Drizzle wraps the driver error in `cause`.
  for (let e = error as { code?: string; cause?: unknown } | undefined; e; e = e.cause as never) {
    if (e.code === '23505') return true;
  }
  return false;
}
