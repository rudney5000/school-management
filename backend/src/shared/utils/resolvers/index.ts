import type {
    AttachableType
} from '@/modules/attachments/attachments.schema'
import {
    AttachmentContextResolver,
    reportAttachmentResolver
} from "@/shared/utils/resolvers/attachments/attachment-context-resolver";
import {
    ConversationAttachmentResolver
} from "@/shared/utils/resolvers/attachments/conversation.resolver";
import {
    PaymentAttachmentResolver
} from "@/shared/utils/resolvers/attachments/payment.resolver";
import {
    EnrollmentAttachmentResolver
} from "@/shared/utils/resolvers/attachments/enrollment.resolver";
import {
    MessageAttachmentResolver
} from "@/shared/utils/resolvers/attachments/message.resolver";
import {
    TeacherAttachmentResolver
} from "@/shared/utils/resolvers/attachments/teacher.resolver";

export const attachmentResolvers: Record<AttachableType, AttachmentContextResolver> = {
    conversation: new ConversationAttachmentResolver(),
    message:      new MessageAttachmentResolver(),
    enrollment:   new EnrollmentAttachmentResolver(),
    payment:      new PaymentAttachmentResolver(),
    teacher:      new TeacherAttachmentResolver(),
    report:       new reportAttachmentResolver()
}