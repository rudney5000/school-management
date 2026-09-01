import { reportApi } from '@entities/report/api/report.api';
import { useMutation } from '@tanstack/react-query';
import type { UpdateReportStatusDto } from '@entities/report/model/dto';

export const useUpdateReportStatus = () => {
  return useMutation({
    mutationFn: (data: { id: string; dto: UpdateReportStatusDto }) =>
      reportApi.updateStatus(data.id, data.dto),
  });
};
