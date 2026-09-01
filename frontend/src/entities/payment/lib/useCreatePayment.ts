import { useMutation, useQueryClient } from '@tanstack/react-query';
import { handleApiError } from '@shared/lib';
import { paymentApi, type CreatePaymentDto } from '@entities/payment';

export const useCreatePayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreatePaymentDto) => paymentApi.create(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments', 'list'] });
    },
    onError: (error: Error) => {
      handleApiError(error);
    },
  });
};
