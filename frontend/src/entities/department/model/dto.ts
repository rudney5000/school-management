export type CreateDepartmentDto = {
    name: string
    code: string
    countryId: string
}

export type UpdateDepartmentDto = Partial<CreateDepartmentDto>

export type DepartmentParamsDto = {
    id: string
}

export type DepartmentListQueryDto = {
    countryId?: string
}
