import {withDataTable} from "@shared/ui";
import type {Exam} from "@entities/exams";

export const ExamTable = withDataTable<Exam>({
    getRowId: (row) => row.id,
    searchKey: 'title',
    columns: [],
})