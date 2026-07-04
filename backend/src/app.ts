import compression from 'compression';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import {env} from "@/config/env";
import {studentsRouter} from "@/modules/students/students.router";
import {countriesRouter} from "@/modules/countries/countries.router";
import {departmentsRouter} from "@/modules/departments/departments.router";
import {citiesRouter} from "@/modules/cities/cities.router";
import {districtsRouter} from "@/modules/districts/districts.router";
import {errorHandler} from "@/middleware/error-handler";
import {authRouter} from "@/modules/auth/auth.router";
import {teachersRouter} from "@/modules/teachers/teachers.router";
import {coursesRouter} from "@/modules/courses/courses.router";
import {classesRouter} from "@/modules/classes/classes.router";
import {schedulesRouter} from "@/modules/schedules/schedules.router";
import {workersRouter} from "@/modules/workers/workers.router";
import {schoolsRouter} from "@/modules/schools/schools.router";
import {enrollmentsRouter} from "@/modules/enrollments/enrollments.router";
import {parentsRouter} from "@/modules/parents/parents.router";
import {paymentsRouter} from "@/modules/payments/payments.router";
import {subSchoolsRouter} from "@/modules/sub-schools/sub-schools.router";
import {eventsRouter} from "@/modules/events/events.router";
import {
  studentAttendanceRouter,
  teacherAttendanceRouter
} from "@/modules/attendances/attendances.router";
import {examsRouter} from "@/modules/exams/exams.router";
import {academicPeriodsRouter} from "@/modules/academic-periods/academic-periods.router";
import {gradesRouter} from "@/modules/grades/grades.router";
import {chatRouter} from "@/modules/chat/chat.router";
import {attachmentsRouter} from "@/modules/attachments/attachments.router";
import {videoCallsRouter} from "@/modules/videoCalls/videoCalls.router";
import {liveSessionsRouter} from "@/modules/liveSessions/liveSessions.router";

export function createApp(): express.Application {
  const app = express();

  app.use(helmet());
  app.use(compression());
  app.use(cors({ origin: env.ALLOWED_ORIGINS }));
  app.use(express.json());

  if (env.NODE_ENV !== 'test') {
    app.use(morgan('dev'));
  }

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', env: env.NODE_ENV });
  });

  app.use('/api/auth', authRouter);
  app.use('/api/students', studentsRouter);
  app.use('/api/countries', countriesRouter);
  app.use('/api/departments', departmentsRouter);
  app.use('/api/cities', citiesRouter);
  app.use('/api/districts', districtsRouter);
  app.use('/api/teachers', teachersRouter);
  app.use('/api/schools', schoolsRouter);
  app.use('/api/courses', coursesRouter);
  app.use('/api/classes', classesRouter);
  app.use('/api/schedules', schedulesRouter);
  app.use('/api/workers', workersRouter)
  app.use('/api/enrollments', enrollmentsRouter)
  app.use('/api/parents', parentsRouter);
  app.use('/api/payments', paymentsRouter);
  app.use('/api/sub-schools', subSchoolsRouter)
  app.use('/api/events', eventsRouter)
  app.use('/api/attendances/students', studentAttendanceRouter);
  app.use('/api/attendances/teachers', teacherAttendanceRouter);
  app.use('/api/exams', examsRouter);
  app.use('/api/academic-periods', academicPeriodsRouter)
  app.use('/api/grades', gradesRouter)
  app.use('/api/chats', chatRouter)
  app.use('/api/attachments', attachmentsRouter)
  app.use('/api/video-calls', videoCallsRouter);
  app.use('/api/live-sessions', liveSessionsRouter);


  app.use(errorHandler);

  return app;
}
