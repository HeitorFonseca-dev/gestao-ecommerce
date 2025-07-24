export class TokenJWTPayload {
  sub: number | string;
  name: string;
  iss?: string;
  aud?: string;
  iat?: number;
  role?: string;
  data?: [];
}
