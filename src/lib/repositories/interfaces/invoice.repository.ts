import { Invoice } from "@prisma/client";

export interface IInvoiceRepository {
  create(data: any): Promise<Invoice>;
  findById(id: string): Promise<Invoice | null>;
  findByOrderId(orderId: string): Promise<Invoice | null>;
  findByInvoiceNumber(invoiceNumber: string): Promise<Invoice | null>;
  update(id: string, data: any): Promise<Invoice>;
  findUserInvoices(userId: string): Promise<Invoice[]>;
  findAll(): Promise<Invoice[]>;
}
