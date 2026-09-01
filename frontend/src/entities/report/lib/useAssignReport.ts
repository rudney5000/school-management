import { reportApi } from '@entities/report/api/report.api';
import { useMutation } from '@tanstack/react-query';
import type { AssignReportDto } from '@entities/report/model/dto';

export const useAssignReport = () => {
  return useMutation({
    mutationFn: (data: { id: string; dto: AssignReportDto }) => reportApi.assign(data.id, data.dto),
  });
};
