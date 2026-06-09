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
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware(),
})

setupListeners(store.dispatch)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
