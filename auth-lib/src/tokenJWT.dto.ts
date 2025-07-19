export class TokenJWT {
  sub?: string;
  full_name?: string;
  iss?: string;
  aud?: string;
  data?: {
    roles?: {
      id: string;
      description: string;
      created_at: Date;
      created_by: string;
      updated_at?: Date;
      updated_by?: string;
      storeId?: string;
    }[];
  }[];
  iat?: number;
  accessToken?: string | null;
  refreshToken?: string | null;
}
