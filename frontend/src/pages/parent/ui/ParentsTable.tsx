import {withDataTable} from "@shared/ui";
import type {Parent} from "@entities/parent";

export const ParentsTable = withDataTable<Parent>({
    getRowId: (row) => row.id,
    searchKey: 'firstName',
    columns: [],
})