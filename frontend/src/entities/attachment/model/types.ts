export type AttachableType = 'conversation' | 'message' | 'enrollment' | 'payment'

export type AttachmentCategory =
    | 'birth_certificate'
    | 'medical_certificate'
    | 'previous_report'
    | 'parent_id'
    | 'student_photo'
    | 'payment_receipt'
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
