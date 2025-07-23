export class TokenJWT {
  sub?: string;
  full_name?: string;
  iss?: string;
  aud?: string;
  iat?: number;
  accessToken?: string | null;
  refreshToken?: string | null;
}
