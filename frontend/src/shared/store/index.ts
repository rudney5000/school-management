import {configureStore} from "@reduxjs/toolkit";
import {setupListeners} from "@reduxjs/toolkit/query";
import {authSlice} from "@features/auth/store/auth-slice";
import {countrySlice} from "@entities/country";
import {citySlice} from "@entities/city";
import {districtSlice} from "@entities/district";
import {departmentSlice} from "@entities/department";
import {schoolSlice} from "@entities/school";
import {studentSlice} from "@entities/student";
import {subSchoolSlice} from "@entities/sub-school/model/slice";
import {teacherSlice} from "@entities/teacher";
import {parentSlice} from "@entities/parent";
import {classSlice} from "@entities/class";
import {courseSlice} from "@entities/courses";
import {scheduleSlice} from "@entities/schedule";
import {eventSlice} from "@entities/event";
import {attendanceSlice} from "@entities/attendances";
import {examSlice} from "@entities/exams";
import {gradeSlice} from "@entities/grades/model/slice.ts";
import {academicPeriodSlice} from "@entities/academic-period";

export const store = configureStore({
    reducer: {
        auth: authSlice.reducer,
        country: countrySlice.reducer,
        city: citySlice.reducer,
        district: districtSlice.reducer,
        department: departmentSlice.reducer,
        school: schoolSlice.reducer,
        subSchool: subSchoolSlice.reducer,
        student: studentSlice.reducer,
        teacher: teacherSlice.reducer,
        parent: parentSlice.reducer,
        class: classSlice.reducer,
        course: courseSlice.reducer,
        schedule: scheduleSlice.reducer,
        event: eventSlice.reducer,
        attendance: attendanceSlice.reducer,
        exam: examSlice.reducer,
        grades: gradeSlice.reducer,
        academicPeriod: academicPeriodSlice.reducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware(),
})

setupListeners(store.dispatch)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
