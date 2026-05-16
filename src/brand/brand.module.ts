import { Module } from '@nestjs/common';
import { PrismaModule } from 'prisma/prisma.module';
import { CacheModule } from '../common/cache/cache.module';
import { StorageModule } from '../storage/storage.module';
import { BrandService } from './brand.service';
import { BrandController, AdminBrandController } from './brand.controller';

@Module({
  imports: [PrismaModule, CacheModule, StorageModule],
  providers: [BrandService],
  controllers: [BrandController, AdminBrandController],
  exports: [BrandService],
})
export class BrandModule {}
