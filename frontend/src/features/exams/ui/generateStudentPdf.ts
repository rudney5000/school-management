import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { StudentBulletin } from "@entities/grades";
import type { Course } from "@entities/courses";
import type { Class } from "@entities/class";
import { type AcademicPeriod } from "@entities/academic-period";
import type { SubSchool } from "@entities/sub-school/model/types";
import type { Student } from "@entities/student";

type SubSchoolWithMotto = SubSchool & { motto?: string }

const COLORS = {
    primary: [37, 99, 235] as [number, number, number],
    dark: [17, 24, 39] as [number, number, number],
    gray: [107, 114, 128] as [number, number, number],
    lightGray: [243, 244, 246] as [number, number, number],
    border: [229, 231, 235] as [number, number, number],
    success: [22, 163, 74] as [number, number, number],
    warning: [217, 119, 6] as [number, number, number],
    danger: [220, 38, 38] as [number, number, number],
    white: [255, 255, 255] as [number, number, number],
}

function getPerformanceColor(pct: number): [number, number, number] {
    if (pct >= 70) return COLORS.success
    if (pct >= 50) return COLORS.warning
    return COLORS.danger
}

type SchoolLevel = 'primaire' | 'college' | 'lycee'

function getSchoolLevel(gradeLevel?: string): SchoolLevel {
    if (!gradeLevel) return 'college'
    const g = gradeLevel.toLowerCase()
    const primaireKeywords = ['cp', 'ce1', 'ce2', 'cm1', 'cm2', 'primaire']
    const lyceeKeywords = ['2nde', 'seconde', '1ère', '1ere', 'première', 'terminale', 'lycée', 'lycee']
    if (primaireKeywords.some(k => g.includes(k))) return 'primaire'
    if (lyceeKeywords.some(k => g.includes(k))) return 'lycee'
    return 'college'
}

function getPeriodLabel(level: SchoolLevel, period: AcademicPeriod): string {
    switch (level) {
        case 'primaire':
            return period.name || new Date(period.startDate).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
        default:
            return period.name
    }
}

function calculateAge(dateOfBirth: string): number {
    const birth = new Date(dateOfBirth)
    const today = new Date()
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--
    }
    return age
}

function getGenderLabel(gender: Student['gender']): string {
    return gender === 'male' ? 'Masculin' : 'Féminin'
}

async function urlToBase64(url: string): Promise<string | null> {
    try {
        const response = await fetch(url)
        const blob = await response.blob()
        return await new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = () => resolve(reader.result as string)
            reader.onerror = reject
            reader.readAsDataURL(blob)
        })
    } catch {
        return null
    }
}

export async function generateStudentPdf(
    result: StudentBulletin,
    courses: Course[],
    classInfo: Class,
    subSchool: SubSchoolWithMotto,
    academicPeriod: AcademicPeriod,
    student: Student,
) {
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()
    const margin = 14

    const courseNameById = new Map(courses.map(c => [c.id, c.name]))
    const fullName = `${result.studentFirstName} ${result.studentLastName}`.trim()
    const level = getSchoolLevel(classInfo.gradeLevel)
    const periodLabel = getPeriodLabel(level, academicPeriod)
    const age = calculateAge(student.dateOfBirth)
    const genderLabel = getGenderLabel(student.gender)

    const [logoBase64, studentPhotoBase64] = await Promise.all([
        subSchool.logo ? urlToBase64(subSchool.logo) : Promise.resolve(null),
        student.image ? urlToBase64(student.image) : Promise.resolve(null),
    ])

    doc.setFillColor(...COLORS.primary)
    doc.rect(0, 0, pageWidth, 42, 'F')

    const textStartX = margin + (logoBase64 ? 20 : 0)
    if (logoBase64) {
        try {
            doc.addImage(logoBase64, 'PNG', margin, 8, 16, 16)
        } catch {
        }
    }

    doc.setTextColor(...COLORS.white)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(16)
    doc.text(subSchool.name, textStartX, 17)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    if (subSchool.motto) {
        doc.setTextColor(219, 234, 254)
        doc.text(`« ${subSchool.motto} »`, textStartX, 23)
    }

    doc.setFontSize(10)
    doc.setTextColor(...COLORS.white)
    doc.text('Bulletin de notes', textStartX, 32)

    doc.setFontSize(8)
    doc.setTextColor(219, 234, 254)
    doc.text(`Généré le ${new Date().toLocaleDateString('fr-FR')}`, pageWidth - margin, 32, { align: 'right' })

    const cardY = 50
    const cardHeight = 34
    doc.setFillColor(...COLORS.lightGray)
    doc.roundedRect(margin, cardY, pageWidth - margin * 2, cardHeight, 3, 3, 'F')

    const photoSize = 24
    const photoX = margin + 6
    const photoY = cardY + 5
    if (studentPhotoBase64) {
        try {
            doc.addImage(studentPhotoBase64, 'JPEG', photoX, photoY, photoSize, photoSize)
        } catch {
        }
    } else {
        doc.setFillColor(...COLORS.primary)
        doc.circle(photoX + photoSize / 2, photoY + photoSize / 2, photoSize / 2, 'F')
        doc.setTextColor(...COLORS.white)
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(14)
        const initials = `${result.studentFirstName[0] ?? ''}${result.studentLastName[0] ?? ''}`.toUpperCase()
        doc.text(initials, photoX + photoSize / 2, photoY + photoSize / 2 + 4, { align: 'center' })
    }

    const infoX = photoX + photoSize + 8

    doc.setTextColor(...COLORS.dark)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(13)
    doc.text(fullName, infoX, cardY + 12)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(...COLORS.gray)
    doc.text(`Classe : ${classInfo.name}`, infoX, cardY + 19)
    doc.text(`Période : ${periodLabel}`, infoX, cardY + 25)
    doc.text(`${age} ans · ${genderLabel}`, infoX, cardY + 31)

    if (result.rank) {
        const totalStudents = classInfo.studentsCount ?? classInfo.capacity
        const badgeW = 36
        const badgeX = pageWidth - margin - 8 - badgeW
        doc.setFillColor(...COLORS.primary)
        doc.roundedRect(badgeX, cardY + 8, badgeW, 18, 2, 2, 'F')
        doc.setTextColor(...COLORS.white)
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(13)
        doc.text(`${result.rank}/${totalStudents}`, badgeX + badgeW / 2, cardY + 17, { align: 'center' })
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(6.5)
        doc.text('RANG', badgeX + badgeW / 2, cardY + 23, { align: 'center' })
    }

    const statsY = cardY + cardHeight + 8
    const stats = [
        { label: 'Moyenne pondérée', value: `${result.weightedAverage.toFixed(2)}/20` },
        { label: 'Moyenne simple', value: `${result.average.toFixed(2)}/20` },
        { label: 'Moyenne de classe', value: `${result.classAverage?.toFixed(2) ?? '—'}/20` },
    ]
    const statBoxW = (pageWidth - margin * 2 - 8 * 2) / 3
    const statBoxH = 20

    stats.forEach((stat, i) => {
        const x = margin + i * (statBoxW + 8)
        doc.setDrawColor(...COLORS.border)
        doc.setLineWidth(0.3)
        doc.roundedRect(x, statsY, statBoxW, statBoxH, 2, 2, 'S')

        doc.setFont('helvetica', 'bold')
        doc.setFontSize(13)
        doc.setTextColor(...COLORS.primary)
        doc.text(stat.value, x + statBoxW / 2, statsY + 10, { align: 'center' })

        doc.setFont('helvetica', 'normal')
        doc.setFontSize(7.5)
        doc.setTextColor(...COLORS.gray)
        doc.text(stat.label, x + statBoxW / 2, statsY + 16, { align: 'center' })
    })

    const tableY = statsY + statBoxH + 10

    autoTable(doc, {
        startY: tableY,
        head: [['Matière', 'Note', 'Max', 'Coeff.', 'Résultat']],
        body: result.grades.map(g => {
            const score = parseFloat(g.score)
            const max = parseFloat(g.maxScore)
            const pct = max > 0 ? (score / max) * 100 : 0
            return [
                courseNameById.get(g.courseId) ?? 'Matière inconnue',
                g.score,
                g.maxScore,
                g.coefficient,
                `${pct.toFixed(1)}%`,
            ]
        }),
        styles: {
            fontSize: 9.5,
            cellPadding: 4,
            textColor: COLORS.dark,
            lineColor: COLORS.border,
            lineWidth: 0.2,
        },
        headStyles: {
            fillColor: COLORS.primary,
            textColor: COLORS.white,
            fontStyle: 'bold',
            fontSize: 9.5,
        },
        alternateRowStyles: { fillColor: [249, 250, 251] },
        columnStyles: {
            0: { fontStyle: 'bold' },
            1: { halign: 'center' },
            2: { halign: 'center' },
            3: { halign: 'center' },
            4: { halign: 'center', fontStyle: 'bold' },
        },
        didParseCell: (data) => {
            if (data.section === 'body' && data.column.index === 4) {
                const pct = parseFloat(data.cell.raw as string)
                data.cell.styles.textColor = getPerformanceColor(pct)
            }
        },
    })

    const pageCount = doc.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i)
        const pageHeight = doc.internal.pageSize.getHeight()
        doc.setDrawColor(...COLORS.border)
        doc.setLineWidth(0.2)
        doc.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15)

        doc.setFontSize(8)
        doc.setTextColor(...COLORS.gray)
        doc.text(subSchool.name, margin, pageHeight - 9)
        doc.text(`Page ${i}/${pageCount}`, pageWidth - margin, pageHeight - 9, { align: 'right' })
    }

    return doc
}

export async function downloadStudentPdf(
    result: StudentBulletin,
    courses: Course[],
    classInfo: Class,
    subSchool: SubSchoolWithMotto,
    academicPeriod: AcademicPeriod,
    student: Student,
) {
    const doc = await generateStudentPdf(result, courses, classInfo, subSchool, academicPeriod, student)
    doc.save(`bulletin-${result.studentLastName}-${result.studentFirstName}.pdf`)
}

export async function openStudentPdf(
    result: StudentBulletin,
    courses: Course[],
    classInfo: Class,
    subSchool: SubSchoolWithMotto,
    academicPeriod: AcademicPeriod,
    student: Student,
) {
    const doc = await generateStudentPdf(result, courses, classInfo, subSchool, academicPeriod, student)
    window.open(doc.output('bloburl'), '_blank')
}