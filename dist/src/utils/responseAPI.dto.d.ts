import { PaginationDTO } from './pagination.dto';
export declare class ResponseAPI {
    data: object | null | boolean;
    message?: string | null;
    statusCode?: number;
    metaPagination?: PaginationDTO;
}
