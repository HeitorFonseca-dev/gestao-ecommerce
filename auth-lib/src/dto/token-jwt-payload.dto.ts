export class TokenJWTPayload {
  sub: string;
  name: string;
  iss?: string;
  aud?: string;
  iat?: number;
  data?: [];
}
