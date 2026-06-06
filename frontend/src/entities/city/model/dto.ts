export type CreateCityDto = {
    name: string
    departmentId: string
}

export type UpdateCityDto = Partial<CreateCityDto>

export type CityParamsDto = {
    id: string
}

export type CityListQueryDto = {
    departmentId?: string
}
