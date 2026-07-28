export type AttachableType = 'conversation' | 'message' | 'enrollment' | 'payment' | 'teacher'

export type AttachmentCategory =
    | 'birth_certificate'
    | 'medical_certificate'
    | 'previous_report'
    | 'parent_id'
    | 'student_photo'
    | 'teacher_photo'
    | 'payment_receipt'
    | 'diploma'
    | 'criminal_record'
    | 'resume'
    | 'identity_document'
    | 'other'


export type AttachmentStatus = 'pending' | 'validated' | 'rejected'

export type Attachment = {
    id:              string
    attachableType:  AttachableType
    attachableId:    string
    category:        AttachmentCategory
    key:             string
    filename:        string
    mimeType:        string
    size:            number
    width:           number | null
    height:          number | null
    uploadedBy:      string
    status:          AttachmentStatus
    rejectionReason: string | null
    validatedBy:     string | null
    validatedAt:     string | null
    createdAt:       string
}
