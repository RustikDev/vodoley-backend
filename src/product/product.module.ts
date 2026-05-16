import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController, InventoryStatusController } from './product.controller';
import { AdminProductController } from './admin-product.controller';
import { PrismaModule } from 'prisma/prisma.module';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [PrismaModule, StorageModule],
  controllers: [ProductController, AdminProductController, InventoryStatusController],
  providers: [ProductService],
})
export class ProductModule {}
