import { AppError } from '@/shared/errors/app-error';
import type {
  AttachmentContext,
  AttachmentContextResolver,
} from '@/shared/utils/resolvers/attachments/attachment-context-resolver';

/**
 * Curriculum files are managed only through `/api/curricula`, which checks the
 * caller's sub-school from the request and the parent/student scope. The
 * generic attachment routes only know the user id and role, so they refuse.
 */
export class CurriculumAttachmentResolver implements AttachmentContextResolver {
  async resolve(): Promise<AttachmentContext> {
    throw new AppError(
      'FORBIDDEN',
      'Les fichiers des programmes se gèrent via /api/curricula',
      403,
    );
  }
}
