import {
    useState,
    useMemo,
    useEffect
} from "react"
import { useParams } from "@tanstack/react-router"
import { useAppSelector } from "@shared/store/hooks"
import { selectSchoolId } from "@features/auth/model/selectors"
import {
    useGrades,
    type StudentBulletin
} from "@entities/grades"
import {
    useClass,
    useClasses
} from "@entities/class"
import { useStudents } from "@entities/student"
import { useCourses } from "@entities/courses"
import {
    useAcademicPeriod,
    useAcademicPeriods
} from "@entities/academic-period"
import { useSubSchool } from "@entities/sub-school"
import {
    downloadStudentPdf,
    openStudentPdf
} from "@features/exams/ui/generateStudentPdf"

export type SortBy = "average" | "weighted" | "name"

export function useResultsBulletin() {
    const { subSchoolId } = useParams({ strict: false })
    const schoolId = useAppSelector(selectSchoolId)

    const [selectedClassId, setSelectedClassId] = useState<string>("")
    const [selectedPeriod, setSelectedPeriod] = useState<string>("all")
    const [sortBy, setSortBy] = useState<SortBy>("weighted")

    const { data: classes = [] } = useClasses(subSchoolId)
    const { data: courses } = useCourses(subSchoolId)
    const { data: students = [] } = useStudents(subSchoolId)
    const { data: academicPeriods = [] } = useAcademicPeriods(
        subSchoolId ? { subSchoolId } : undefined
    )
    const { data: subSchool } = useSubSchool(subSchoolId, schoolId ?? undefined)

    useEffect(() => {
        if (classes.length > 0 && !selectedClassId) {
            setSelectedClassId(classes[0].id)
        }
    }, [classes, selectedClassId])

    const isPeriodSelected = selectedPeriod !== "all"

    const { data: grades = [], isLoading: gradesLoading } = useGrades({
        classId: selectedClassId,
        subSchoolId,
        ...(isPeriodSelected && { academicPeriodId: selectedPeriod }),
    })

    const { data: classInfo } = useClass(selectedClassId, subSchoolId)
    const { data: academicPeriod } = useAcademicPeriod(
        isPeriodSelected ? selectedPeriod : undefined,
        subSchoolId
    )

    const canGeneratePdf = isPeriodSelected && !!courses && !!classInfo && !!subSchool && !!academicPeriod

    const studentLookup = useMemo(
        () => new Map(students.map(s => [s.id, s])),
        [students]
    )

    const studentResults = useMemo(() => {
        const studentMap = new Map<string, StudentBulletin>()

        grades.forEach(grade => {
            const student = studentLookup.get(grade.studentId)
            const existing = studentMap.get(grade.studentId)

            if (existing) {
                existing.grades.push(grade)
            } else {
                studentMap.set(grade.studentId, {
                    studentId: grade.studentId,
                    studentFirstName: student?.firstName ?? "",
                    studentLastName: student?.lastName ?? "",
                    studentName: student
                        ? `${student.firstName} ${student.lastName}`
                        : grade.studentId.slice(0, 8),
                    grades: [grade],
                    average: 0,
                    weightedAverage: 0,
                    totalCoefficient: 0,
                    rank: 0,
                    classAverage: 0
                })
            }
        })

        const results = Array.from(studentMap.values()).map(result => {
            let totalScore = 0
            let totalMaxScore = 0
            let weightedSum = 0
            let totalCoefficient = 0

            result.grades.forEach(grade => {
                const score = parseFloat(grade.score)
                const maxScore = parseFloat(grade.maxScore)
                const coeff = parseFloat(grade.coefficient)

                totalScore += score
                totalMaxScore += maxScore
                weightedSum += (score / maxScore) * coeff
                totalCoefficient += coeff
            })

            const average = totalMaxScore > 0 ? (totalScore / totalMaxScore) * 20 : 0
            const weightedAverage = totalCoefficient > 0 ? (weightedSum / totalCoefficient) * 20 : 0

            return { ...result, average, weightedAverage, totalCoefficient }
        })

        const sorted = [...results].sort((a, b) => b.weightedAverage - a.weightedAverage)
        const classAvg = sorted.length > 0
            ? sorted.reduce((sum, r) => sum + r.weightedAverage, 0) / sorted.length
            : 0

        sorted.forEach((result, index) => {
            result.rank = index + 1
            result.classAverage = classAvg
        })

        return sorted
    }, [grades, studentLookup])

    const sortedResults = useMemo(() => {
        const sorted = [...studentResults]
        switch (sortBy) {
            case "average": return sorted.sort((a, b) => b.average - a.average)
            case "weighted": return sorted.sort((a, b) => b.weightedAverage - a.weightedAverage)
            case "name": return sorted.sort((a, b) => a.studentLastName.localeCompare(b.studentLastName))
            default: return sorted
        }
    }, [studentResults, sortBy])

    const classStats = useMemo(() => {
        if (studentResults.length === 0) return null

        const averages = studentResults.map(s => s.weightedAverage)
        const classAverage = averages.reduce((sum, avg) => sum + avg, 0) / averages.length
        const maxAverage = Math.max(...averages)
        const minAverage = Math.min(...averages)
        const passCount = studentResults.filter(s => s.weightedAverage >= 10).length
        const passRate = (passCount / studentResults.length) * 100

        return { classAverage, maxAverage, minAverage, passCount, passRate, totalStudents: studentResults.length }
    }, [studentResults])

    const handleOpenPdf = async (result: StudentBulletin) => {
        const student = studentLookup.get(result.studentId)
        if (!canGeneratePdf || !student || !classInfo || !subSchool || !academicPeriod || !courses) return
        await openStudentPdf(result, courses, classInfo, subSchool, academicPeriod, student)
    }

    const handleDownloadPdf = async (result: StudentBulletin) => {
        const student = studentLookup.get(result.studentId)
        if (!canGeneratePdf || !student || !classInfo || !subSchool || !academicPeriod || !courses) return
        await downloadStudentPdf(result, courses, classInfo, subSchool, academicPeriod, student)
    }

    return {
        classes,
        academicPeriods,
        selectedClassId,
        setSelectedClassId,
        selectedPeriod,
        setSelectedPeriod,
        sortBy,
        setSortBy,
        sortedResults,
        classStats,
        canGeneratePdf,
        gradesLoading,
        handleOpenPdf,
        handleDownloadPdf,
    }
}