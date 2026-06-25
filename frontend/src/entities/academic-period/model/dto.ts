import {AcademicPeriodType} from "@entities/academic-period";

export type AcademicPeriodParamsDto = {
    id: string
}

export type AcademicPeriodListQueryDto = {
    subSchoolId: string
}

export type CreateAcademicPeriodDto = {
    name:      string
    type:      AcademicPeriodType
    startDate: string
    endDate:   string
    isCurrent?: boolean
}

export type UpdateAcademicPeriodDto = {
    name?:      string
    type?:      AcademicPeriodType
    startDate?: string
    endDate?:   string
    isCurrent?: boolean
}