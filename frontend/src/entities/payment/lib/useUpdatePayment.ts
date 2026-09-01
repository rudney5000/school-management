import { useMutation, useQueryClient } from '@tanstack/react-query';
import { handleApiError } from '@shared/lib';
import { paymentApi, type PaymentParamsDto, type UpdatePaymentDto } from '@entities/payment';

export const useUpdatePayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...dto }: PaymentParamsDto & UpdatePaymentDto) =>
      paymentApi.update({ id }, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments', 'list'] });
    },
    onError: (error: Error) => {
      handleApiError(error);
    },
  });
};
