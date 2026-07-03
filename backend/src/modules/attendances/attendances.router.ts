import { Router } from 'express';
import { validate } from '@/shared/utils/validate';
import { authenticate } from '@/middleware/authenticate';
import { authorize } from '@/middleware/authorize';
import {StudentAttendanceController, TeacherAttendanceController} from "@/modules/attendances/attendances.controller";
import {
    attendanceQuerySchema,
    bulkUpsertStudentAttendanceSchema,
    bulkUpsertTeacherAttendanceSchema,
    createStudentAttendanceSchema,
    createTeacherAttendanceSchema,
    studentAttendanceParamsSchema,
    subSchoolQuerySchema,
    teacherAttendanceParamsSchema,
    updateStudentAttendanceSchema,
    updateTeacherAttendanceSchema
} from "@/modules/attendances/attendances.schema";

const studentRouter = Router();
const studentController = new StudentAttendanceController();

studentRouter.get(
    '/',
    authenticate,
    authorize('admin', 'director', 'teacher', 'student', 'super_admin'),
    validate({
        query: attendanceQuerySchema
    }),
    studentController.getAll,
);

studentRouter.get(
    '/:id',
    authenticate,
    authorize('admin', 'director', 'teacher', 'student', 'super_admin'),
    validate({
        params: studentAttendanceParamsSchema,
        query: subSchoolQuerySchema
    }),
    studentController.getById,
);

studentRouter.post(
    '/',
    authenticate,
    authorize('admin', 'teacher', 'super_admin'),
    validate({
        body: createStudentAttendanceSchema
    }),
    studentController.create,
);

studentRouter.post(
    '/bulk',
    authenticate,
    authorize('admin', 'teacher', 'super_admin'),
    validate({
        body: bulkUpsertStudentAttendanceSchema
    }),
    studentController.bulkUpsert,
);

studentRouter.patch(
    '/:id',
    authenticate,
    authorize('admin', 'teacher', 'super_admin'),
    validate({
        params: studentAttendanceParamsSchema,
        query:  subSchoolQuerySchema,
        body:   updateStudentAttendanceSchema,
    }),
    studentController.update,
);

studentRouter.delete(
    '/:id',
    authenticate,
    authorize('admin', 'super_admin'),
    validate({
        params: studentAttendanceParamsSchema,
        query: subSchoolQuerySchema
    }),
    studentController.remove,
);

const teacherRouter = Router();
const teacherController = new TeacherAttendanceController();

teacherRouter.get(
    '/',
    authenticate,
    authorize('admin', 'director', 'teacher', 'super_admin', 'student'),
    validate({
        query: attendanceQuerySchema
    }),
    teacherController.getAll,
);

teacherRouter.get(
    '/:id',
    authenticate,
    authorize('admin', 'director', 'teacher', 'super_admin', 'student'),
    validate({
        params: teacherAttendanceParamsSchema,
        query: subSchoolQuerySchema
    }),
    teacherController.getById,
);

teacherRouter.post(
    '/',
    authenticate,
    authorize('admin', 'director', 'super_admin'),
    validate({ body: createTeacherAttendanceSchema }),
    teacherController.create,
);

teacherRouter.post(
    '/bulk',
    authenticate,
    authorize('admin', 'director', 'super_admin'),
    validate({
        body: bulkUpsertTeacherAttendanceSchema
    }),
    teacherController.bulkUpsert,
);

teacherRouter.patch(
    '/:id',
    authenticate,
    authorize('admin', 'director', 'super_admin'),
    validate({
        params: teacherAttendanceParamsSchema,
        query:  subSchoolQuerySchema,
        body:   updateTeacherAttendanceSchema,
    }),
    teacherController.update,
);

teacherRouter.delete(
    '/:id',
    authenticate,
    authorize('admin', 'director', 'super_admin'),
    validate({
        params: teacherAttendanceParamsSchema,
        query: subSchoolQuerySchema
    }),
    teacherController.remove,
);

export { studentRouter as studentAttendanceRouter };
export { teacherRouter as teacherAttendanceRouter };