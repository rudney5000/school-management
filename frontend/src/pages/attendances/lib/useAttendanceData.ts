import { useMemo } from "react"
import {
    useStudentAttendances,
    useTeacherAttendances
} from "@entities/attendances"
import { useStudents } from "@entities/student"
import type {
    StudentAttendance,
    TeacherAttendance,
    AttendanceStatus
} from "@entities/attendances/model/types"

interface ChartData {
    month: string
    students: number
    teachers: number
    staff: number
}

export function useAttendanceData(subSchoolId: string | undefined, fromDate: string, toDate: string) {
    const { data: students = [], isLoading: loadingStudentsData } = useStudents(subSchoolId)
    
    const { data: studentAttendances, isLoading: loadingStudents } = useStudentAttendances({
        subSchoolId: subSchoolId || '',
        from: fromDate,
        to: toDate,
        page: 1,
        limit: 100,
    })

    const { data: teacherAttendances, isLoading: loadingTeachers } = useTeacherAttendances({
        subSchoolId: subSchoolId || '',
        from: fromDate,
        to: toDate,
        page: 1,
        limit: 100,
    })

    const attendanceMap = useMemo(() => {
        const map = new Map<string, AttendanceStatus>()
        studentAttendances?.data?.forEach((r: StudentAttendance) => {
            map.set(`${r.studentId}__${r.date}`, r.status)
        })
        teacherAttendances?.data?.forEach((r: TeacherAttendance) => {
            map.set(`${r.teacherId}__${r.date}`, r.status)
        })
        return map
    }, [studentAttendances?.data, teacherAttendances?.data])

    const chartData = useMemo(() => {
        return calculateMonthlyAttendance(studentAttendances?.data, teacherAttendances?.data)
    }, [studentAttendances?.data, teacherAttendances?.data])

    return {
        students,
        studentAttendances: studentAttendances?.data || [],
        teacherAttendances: teacherAttendances?.data || [],
        attendanceMap,
        chartData,
        loading: loadingStudents || loadingTeachers || loadingStudentsData,
    }
}

function calculateMonthlyAttendance(
    studentAttendances: StudentAttendance[] | undefined,
    teacherAttendances: TeacherAttendance[] | undefined
): ChartData[] {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    const currentYear = new Date().getFullYear()
    
    const monthlyStats = new Map<number, { students: { present: number; total: number }, teachers: { present: number; total: number } }>()
    
    for (let i = 0; i < 12; i++) {
        monthlyStats.set(i, { students: { present: 0, total: 0 }, teachers: { present: 0, total: 0 } })
    }
    
    studentAttendances?.forEach((attendance) => {
        const date = new Date(attendance.date)
        if (date.getFullYear() === currentYear) {
            const monthIndex = date.getMonth()
            const stats = monthlyStats.get(monthIndex)
            if (stats) {
                stats.students.total++
                if (attendance.status === "PRESENT" || attendance.status === "LATE") {
                    stats.students.present++
                }
            }
        }
    })
    
    teacherAttendances?.forEach((attendance) => {
        const date = new Date(attendance.date)
        if (date.getFullYear() === currentYear) {
            const monthIndex = date.getMonth()
            const stats = monthlyStats.get(monthIndex)
            if (stats) {
                stats.teachers.total++
                if (attendance.status === "PRESENT" || attendance.status === "LATE") {
                    stats.teachers.present++
                }
            }
        }
    })
    
    const chartData: ChartData[] = []
    const currentMonth = new Date().getMonth()
    
    for (let i = 5; i >= 0; i--) {
        const monthIndex = (currentMonth - i + 12) % 12
        const stats = monthlyStats.get(monthIndex)
        if (stats) {
            const studentRate = stats.students.total > 0 ? Math.round((stats.students.present / stats.students.total) * 100) : 0
            const teacherRate = stats.teachers.total > 0 ? Math.round((stats.teachers.present / stats.teachers.total) * 100) : 0
            const staffRate = teacherRate > 0 ? Math.round(teacherRate * 0.95) : 0
            
            chartData.push({
                month: months[monthIndex],
                students: studentRate,
                teachers: teacherRate,
                staff: staffRate,
            })
        }
    }
    
    return chartData
}
