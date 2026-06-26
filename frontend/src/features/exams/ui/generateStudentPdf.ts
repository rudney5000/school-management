import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import type {StudentBulletin} from "@entities/grades";

export function generateStudentPdf(result: StudentBulletin, schoolName = 'École') {
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()

    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text(schoolName, pageWidth / 2, 20, { align: 'center' })

    doc.setFontSize(13)
    doc.text('Bulletin de notes', pageWidth / 2, 30, { align: 'center' })

    doc.setFontSize(11)
    doc.setFont('helvetica', 'normal')
    doc.text(`Élève : ${result.studentName}`, 14, 45)
    doc.text(`Rang : ${result.rank}`, 14, 53)
    doc.text(`Moyenne pondérée : ${result.weightedAverage.toFixed(2)}/20`, 14, 61)
    doc.text(`Moyenne simple : ${result.average.toFixed(2)}/20`, 14, 69)

    doc.setLineWidth(0.5)
    doc.line(14, 74, pageWidth - 14, 74)

    autoTable(doc, {
        startY: 80,
        head: [['Matière', 'Note', 'Max', 'Coeff.', '%']],
        body: result.grades.map(g => {
            const score = parseFloat(g.score)
            const max = parseFloat(g.maxScore)
            const pct = max > 0 ? ((score / max) * 100).toFixed(1) : '—'
            return [
                g.courseId ?? '—',
                g.score,
                g.maxScore,
                g.coefficient,
                `${pct}%`,
            ]
        }),
        styles: { fontSize: 10 },
        headStyles: { fillColor: [23, 85, 236] },
        alternateRowStyles: { fillColor: [245, 247, 255] },
    })

    const finalY = (doc as any).lastAutoTable.finalY + 10
    doc.setFontSize(9)
    doc.setTextColor(120)
    doc.text(
        `Généré le ${new Date().toLocaleDateString('fr-FR')}`,
        pageWidth / 2,
        finalY,
        { align: 'center' }
    )

    return doc
}

export function downloadStudentPdf(result: StudentBulletin) {
    const doc = generateStudentPdf(result)
    doc.save(`bulletin-${result.studentLastName}-${result.studentFirstName}.pdf`)
}

export function openStudentPdf(result: StudentBulletin) {
    const doc = generateStudentPdf(result)
    window.open(doc.output('bloburl'), '_blank')
}