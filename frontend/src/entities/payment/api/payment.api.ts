import { ApiWrapper } from '@shared/api/ApiWrapper';
import { baseApi } from '@shared/api/instance';
import type {
  Payment,
  CreatePaymentDto,
  UpdatePaymentDto,
  PaymentParamsDto,
} from '@entities/payment';

export class PaymentApi extends ApiWrapper {
  constructor() {
    super(baseApi);
  }

  getAll() {
    return this.handleRequest<Payment[]>(this._baseApi.get('/payments'), (raw) => raw as Payment[]);
  }

  getById(params: PaymentParamsDto) {
    return this.handleRequest<Payment>(
      this._baseApi.get(`/payments/${params.id}`),
      (raw) => raw as Payment,
    );
  }

  create(payload: CreatePaymentDto) {
    return this.handleRequest<Payment>(
      this._baseApi.post('/payments', payload),
      (raw) => raw as Payment,
    );
  }

  update(params: PaymentParamsDto, payload: UpdatePaymentDto) {
    return this.handleRequest<Payment>(
      this._baseApi.patch(`/payments/${params.id}`, payload),
      (raw) => raw as Payment,
    );
  }

  delete(id: string) {
    return this.handleRequest(this._baseApi.delete(`/payments/${id}`), undefined);
  }
}

export const paymentApi = new PaymentApi();
