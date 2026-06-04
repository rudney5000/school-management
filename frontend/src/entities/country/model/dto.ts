export type CreateCountryDto = {
    name: string
    code: string
}

export type UpdateCountryDto = Partial<CreateCountryDto>

export type CountryParamsDto = {
    id: string
}