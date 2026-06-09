import {ApiWrapper} from "@shared/api/ApiWrapper";
import {baseApi} from "@shared/api/instance";
import type {
    CourseParamsDto,
    CourseListQueryDto
} from "@entities/courses/model/dto";
import type {
    CreateCourseDto,
    Course,
    UpdateCourseDto
} from "@entities/courses";

export class CourseApi extends ApiWrapper {
    constructor() {
        super(baseApi);
    }

    getAll(params?: CourseListQueryDto) {
        return this.handleRequest<Course[]>(
            this._baseApi.get('/courses', params ),
            (raw) => raw as Course[]
        )
    }

    getById(params: CourseParamsDto) {
        return this.handleRequest<Course>(
            this._baseApi.get(`/courses/${params.id}`),
            (raw) => raw as Course
        )
    }

    create(payload: CreateCourseDto){
        return this.handleRequest<Course>(
            this._baseApi.post('/courses', payload),
            (raw) => raw as Course
        )
    }

    update(id: string, payload: UpdateCourseDto, subSchoolId: string){
        return this.handleRequest<Course>(
            this._baseApi.patch(`/courses/${id}`, payload, {subSchoolId} ),
            (raw) => raw as Course
        )
    }

    delete(id: string, subSchoolId: string) {
        return this.handleRequest(
            this._baseApi.delete(`/courses/${id}`, {subSchoolId}),
            undefined
        )
    }
}
export const courseApi = new CourseApi()
