import { useState, useCallback } from 'react';
import { chatApi } from '@entities/chat/api/chat.api';
import { handleApiError } from '@shared/lib';
import type { UploadedFile } from '@entities/chat';
import { isSuccess } from '@shared/helperClass/CommonResponse';

export function useFileUpload(conversationId: string) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const uploadFile = useCallback(
    async (file: File): Promise<UploadedFile | null> => {
      setIsUploading(true);
      setUploadProgress(0);

      try {
        const res = await chatApi.presignUpload({
          filename: file.name,
          mimeType: file.type,
          size: file.size,
          // Uploads are filed under the conversation, which the backend checks
          // again when the message is sent.
          attachableType: 'conversation',
          attachableId: conversationId,
        });

        if (!isSuccess(res)) throw new Error('Presign failed');
        const { uploadUrl, key } = res.result;

        const upload = await fetch(uploadUrl, {
          method: 'PUT',
          body: file,
          headers: { 'Content-Type': file.type },
        });
        if (!upload.ok) throw new Error(`Upload failed (${upload.status})`);

        setUploadProgress(100);

        let width: number | undefined;
        let height: number | undefined;

        if (file.type.startsWith('image/')) {
          const dimensions = await getImageDimensions(file);
          width = dimensions?.width;
          height = dimensions?.height;
        }

        return {
          key,
          filename: file.name,
          mimeType: file.type,
          size: file.size,
          width,
          height,
        };
      } catch (err) {
        handleApiError(err as Error);
        return null;
      } finally {
        setIsUploading(false);
      }
    },
    [conversationId],
  );

  return { uploadFile, isUploading, uploadProgress };
}

/** Undefined when the browser cannot decode the image: the dimensions are optional. */
function getImageDimensions(file: File): Promise<{ width: number; height: number } | undefined> {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
      URL.revokeObjectURL(url);
    };
    img.onerror = () => {
      resolve(undefined);
      URL.revokeObjectURL(url);
    };
    img.src = url;
  });
}
