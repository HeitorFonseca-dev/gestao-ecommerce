export declare class PaginationDTO {
    skip: number;
    take: number;
    sort: string;
    order: string;
    page: number;
    totalPage: number;
    totalRecords: number;
    pagePrev: number | boolean;
    pageNext: number | boolean;
    status?: string;
    startDate?: Date;
    endDate?: Date;
    constructor(pagination: Partial<PaginationDTO>);
    private toNumberOrDefault;
    calculatePage(): number;
}
