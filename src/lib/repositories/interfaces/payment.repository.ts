import { Payment } from "@prisma/client";

export interface IPaymentRepository {
  create(data: any): Promise<Payment>;
  findById(id: string): Promise<Payment | null>;
  findByGatewayTransactionId(gatewayTransactionId: string): Promise<Payment | null>;
  update(id: string, data: any): Promise<Payment>;
  findUserPayments(userId: string): Promise<Payment[]>;
  findAll(): Promise<Payment[]>;
}
