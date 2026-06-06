import {ApiWrapper} from "@shared/api/ApiWrapper";
import {baseApi} from "@shared/api/instance";
import type {
    DepartmentParamsDto,
    CreateDepartmentDto,
    UpdateDepartmentDto,
    DepartmentListQueryDto
} from "@entities/department/model/dto";
import type {Department} from "@entities/department";

export class DepartmentApi extends ApiWrapper {
    constructor() {
        super(baseApi);
    }

    getAll(params?: DepartmentListQueryDto) {
        return this.handleRequest<Department[]>(
            this._baseApi.get('/departments', { params }),
            (raw) => raw as Department[]
        )
    }

    getById(params: DepartmentParamsDto) {
        return this.handleRequest<Department>(
            this._baseApi.get(`/departments/${params.id}`),
            (raw) => raw as Department
        )
    }

    create(payload: CreateDepartmentDto){
        return this.handleRequest<Department>(
            this._baseApi.post('/departments', payload),
            (raw) => raw as Department
        )
    }

    update(id: string, payload: UpdateDepartmentDto){
        return this.handleRequest<Department>(
            this._baseApi.patch(`/departments/${id}`, payload),
            (raw) => raw as Department
        )
    }

    delete(id: string) {
        return this.handleRequest(
            this._baseApi.delete(`/departments/${id}`),
            undefined
        )
    }
}
export const departmentApi = new DepartmentApi()
