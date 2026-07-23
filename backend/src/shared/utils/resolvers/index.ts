import type {
    AttachableType
} from '@/modules/attachments/attachments.schema'
import {
    AttachmentContextResolver
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

export const attachmentResolvers: Record<AttachableType, AttachmentContextResolver> = {
    conversation: new ConversationAttachmentResolver(),
    enrollment:   new EnrollmentAttachmentResolver(),
    payment:      new PaymentAttachmentResolver(),
}