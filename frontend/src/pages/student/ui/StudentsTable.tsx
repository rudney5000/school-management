import {withDataTable} from "@shared/ui";
import type {Student} from "@entities/student";

export const StudentsTable = withDataTable<Student>({
    getRowId: (row) => row.id,
    searchKey: 'firstName',
    columns: [],
})