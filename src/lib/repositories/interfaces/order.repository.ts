import { Order } from "@prisma/client";

export interface IOrderRepository {
  create(data: any): Promise<Order>;
  findById(id: string): Promise<Order | null>;
  findByGatewayOrderId(gatewayOrderId: string): Promise<Order | null>;
  update(id: string, data: any): Promise<Order>;
  findUserOrders(userId: string): Promise<Order[]>;
  findAll(): Promise<Order[]>;
}
