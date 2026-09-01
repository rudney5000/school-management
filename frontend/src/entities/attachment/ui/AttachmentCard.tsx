import { Badge } from '@shared/ui/badge';
import { Card } from '@shared/ui/card';
import type { Attachment } from '../model/types';

interface AttachmentCardProps {
  attachment: Attachment;
}

const statusConfig = {
  pending: {
    label: 'En attente',
    variant: 'outline' as const,
  },
  validated: {
    label: 'Validé',
    variant: 'success' as const,
  },
  rejected: {
    label: 'Rejeté',
    variant: 'destructive' as const,
  },
};

export function AttachmentCard({ attachment }: AttachmentCardProps) {
  const config = statusConfig[attachment.status];
  const isImage = attachment.mimeType.startsWith('image/');

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          {isImage && attachment.width && attachment.height ? (
            <div className="w-full h-32 bg-muted rounded-md mb-3 flex items-center justify-center overflow-hidden">
              <img
                src={`/${attachment.key}`}
                alt={attachment.filename}
                className="max-w-full max-h-full object-contain"
              />
            </div>
          ) : (
            <div className="w-full h-32 bg-muted rounded-md mb-3 flex items-center justify-center">
              <span className="text-4xl">📄</span>
            </div>
          )}

          <p className="text-sm font-medium text-foreground truncate">{attachment.filename}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {(attachment.size / 1024).toFixed(1)} KB
          </p>

          {attachment.status === 'rejected' && attachment.rejectionReason && (
            <p className="text-xs text-destructive mt-2">Raison: {attachment.rejectionReason}</p>
          )}
        </div>

        <Badge variant={config.variant}>{config.label}</Badge>
      </div>
    </Card>
  );
}
