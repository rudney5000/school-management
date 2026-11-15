import type { AuthTokensDto } from '@features/auth/model/dto/AuthTokensDto';
import type { UserRole } from '@features/auth/model/dto/RegisterDto';

type AccessClaims = {
  id?: string;
  userId?: string;
  sub?: string;
  role: UserRole;
  email?: string;
  phone?: string;
  username?: string;
  schoolId: string;
  subSchoolId?: string;
};

/** The claims of a JWT. Its parts are base64url, which plain `atob` does not accept. */
function decodeClaims(accessToken: string): AccessClaims {
  const part = accessToken.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
  const padded = part.padEnd(part.length + ((4 - (part.length % 4)) % 4), '=');
  const bytes = Uint8Array.from(atob(padded), (char) => char.charCodeAt(0));
  return JSON.parse(new TextDecoder().decode(bytes)) as AccessClaims;
}

/**
 * What the store keeps about the session, read from the access token. Used at
 * login and at every renewal, since a renewed token may carry a new role or school.
 */
export function credentialsFromTokens(tokens: AuthTokensDto) {
  const claims = decodeClaims(tokens.accessToken);

  return {
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    role: claims.role,
    email: claims.email ?? null,
    phone: claims.phone ?? null,
    username: claims.username ?? null,
    userId: claims.id ?? claims.userId ?? claims.sub ?? null,
    schoolId: claims.schoolId,
    subSchoolId: claims.subSchoolId ?? null,
    isAuthenticated: true,
  };
}
