"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaginationDTO = void 0;
class PaginationDTO {
    constructor(pagination) {
        this.skip = this.toNumberOrDefault(pagination.skip, 0);
        this.take = this.toNumberOrDefault(pagination.take, 10);
        this.page = this.toNumberOrDefault(pagination.page, 1);
        this.totalRecords = this.toNumberOrDefault(pagination.totalRecords, 0);
        this.totalPage = 0;
        this.order = pagination.order || 'id';
        this.sort = pagination.sort || 'ASC';
        this.status = pagination.status;
        this.startDate = pagination.startDate
            ? new Date(pagination.startDate)
            : undefined;
        this.endDate = pagination.endDate
            ? new Date(pagination.endDate)
            : undefined;
        this.calculatePage();
        this.pagePrev = this.page === 1 ? false : this.page - 1;
        this.pageNext = this.page < this.totalPage ? this.page + 1 : false;
    }
    toNumberOrDefault(value, fallback) {
        const parsed = Number(value);
        return isNaN(parsed) ? fallback : parsed;
    }
    calculatePage() {
        this.totalPage = Math.ceil(this.totalRecords / this.take);
        return this.totalPage;
    }
}
exports.PaginationDTO = PaginationDTO;
//# sourceMappingURL=pagination.dto.js.map