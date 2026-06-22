import {withDataTable} from "@shared/ui";
import type {Class} from "@entities/class";

export const ClassesTable = withDataTable<Class>({
    getRowId: (row) => row.id,
    searchKey: 'name',
    columns: [],
})