import { PaginationDTO } from './pagination.dto';

export class ResponseAPI {
  data: object | null | boolean;
  message?: string | null;
  statusCode?: number;
  metaPagination?: PaginationDTO;
}
