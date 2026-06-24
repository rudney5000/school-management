import { Router } from 'express'
import {
    ExamsController,
    ExamResultsController
} from './exams.controller'
import {
    createExamSchema,
    examParamsSchema
} from "@/modules/exams/exams.schema";
import {authenticate} from "@/middleware/authenticate";
import {authorize} from "@/middleware/authorize";
import {validate} from "@/shared/utils/validate";
import {
    subSchoolQuerySchema,
    updateStudentSchema
} from "@/modules/students/students.schema";


const examsController = new ExamsController()
const examResultsController = new ExamResultsController()

const router = Router()

router.get(
    '/',
    authenticate,
    authorize('admin', 'director', 'teacher', 'student', 'super_admin'),
    validate({ query: subSchoolQuerySchema }),
    examsController.getAll,
);

router.get(
    '/:id',
    authenticate,
    authorize('admin', 'director', 'teacher', 'parent', 'student', 'super_admin'),
    validate({ params: examParamsSchema, query: subSchoolQuerySchema }),
    examsController.getById,
);

router.post(
    '/',
    authenticate,
    authorize('admin', 'director', 'super_admin', 'teacher'),
    validate({ body: createExamSchema }),
    examsController.create,
);
router.patch(
    '/:id',
    authenticate,
    authorize('admin', 'director', 'super_admin', 'teacher'),
    validate({
        params: examParamsSchema,
        query: subSchoolQuerySchema,
        body: updateStudentSchema,
    }),
    examsController.update,
);
router.delete(
    '/:id',
    authenticate,
    authorize('admin', 'director', 'super_admin', 'teacher'),
    validate({ params: examParamsSchema, query: subSchoolQuerySchema }),
    examsController.remove,
);


router.get(
    '/examId/results',
    authenticate,
    authorize('admin', 'director', 'teacher', 'student', 'super_admin'),
    validate({ query: subSchoolQuerySchema }),
    examResultsController.getByExam,
);

router.get(
    '/students/:studentId/results',
    authenticate,
    authorize('admin', 'director', 'teacher', 'student', 'super_admin'),
    validate({ query: subSchoolQuerySchema }),
    examResultsController.getByStudent,
);

router.post(
    '/results/bulk',
    authenticate,
    authorize('admin', 'director', 'super_admin', 'teacher'),
    validate({ body: createExamSchema }),
    examResultsController.bulkUpsert,
);

export { router as examsRouter };
