import { Module } from '@nestjs/common';
import { PrismaModule } from 'prisma/prisma.module';
import { AdminOrderController } from './admin-order.controller';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';

@Module({
  imports: [PrismaModule],
  controllers: [OrderController, AdminOrderController],
  providers: [OrderService],
})
export class OrderModule {}
