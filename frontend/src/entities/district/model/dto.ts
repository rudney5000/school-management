export type CreateDistrictDto = {
    name: string
    cityId: string
}

export type UpdateDistrictDto = Partial<CreateDistrictDto>

export type DistrictParamsDto = {
    id: string
}

export type DistrictListQueryDto = {
    cityId?: string
}
