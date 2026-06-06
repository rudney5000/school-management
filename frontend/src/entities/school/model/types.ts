export type SchoolId = string

export type DistrictId = string

export type School = {
    id: string
    name: string
    code: string
    email?: string
    phone?: string
    address?: string
    logo?: string
    districtId: string
    createdAt?: string
    updatedAt?: string
}

export type CreateSchoolDto = {
    name: string
    code: string
    email?: string
    phone?: string
    address?: string
    logo?: string
    districtId: string
}

export type UpdateSchoolDto = Partial<Omit<CreateSchoolDto, 'districtId'>>