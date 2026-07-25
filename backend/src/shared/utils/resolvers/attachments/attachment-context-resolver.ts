export interface AttachmentContext {
    subSchoolId: string
}

export interface AttachmentContextResolver {
    resolve(userId: string, userRole: string, attachableId: string): Promise<AttachmentContext>
}