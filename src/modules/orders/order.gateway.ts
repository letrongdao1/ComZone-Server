import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { OrdersService } from './orders.service';
import { Server } from 'socket.io';
import { forwardRef, Inject } from '@nestjs/common';

@WebSocketGateway({ cors: { origin: '*' } })
export class OrdersGateway {
  constructor(
    @Inject(forwardRef(() => OrdersService))
    private readonly ordersService: OrdersService,
  ) {}

  @WebSocketServer()
  server: Server;

  @SubscribeMessage('new-order-status')
  async newOrderStatus(@MessageBody() message: any) {
    const order = await this.ordersService.getById(message.orderId);
    const seller = await this.ordersService.getSellerIdOfAnOrder(
      message.orderId,
    );
    this.server.to([order.user.id, seller.id]).emit('refresh-order', order.id);
  }

  async refreshOrderFromDelivery(orderId: string) {
    const order = await this.ordersService.getById(orderId);
    console.log({ order });
    const seller = await this.ordersService.getSellerIdOfAnOrder(orderId);
    this.server.to([order.user.id, seller.id]).emit('refresh-order', order.id);
  }
}
