import { Module } from '@nestjs/common';
import { CategoryService } from './category.service';
import { AdminCategoryController, CategoryController } from './category.controller';
import { PrismaModule } from 'prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [CategoryService],
  controllers: [CategoryController, AdminCategoryController],
})
export class CategoryModule {}
