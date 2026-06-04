import type {errors} from "@shared/lib/errors/errors.ts";

type ErrorGroups = keyof typeof errors;

type ErrorKeys = {
    [G in ErrorGroups]:
    `${G & string}.${keyof typeof errors[G] & string}`;
}[ErrorGroups];

export type ErrorKey = ErrorKeys;