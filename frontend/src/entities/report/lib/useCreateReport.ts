import { reportApi } from '@entities/report/api/report.api';
import { useMutation } from '@tanstack/react-query';
import type { CreateReportDto } from '@entities/report/model/dto';

export const useCreateReport = () => {
  return useMutation({
    mutationFn: (data: CreateReportDto) => reportApi.create(data),
  });
};
