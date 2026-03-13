import { Module } from '@nestjs/common';
import { PrismaModule } from 'prisma/prisma.module';
import { EstimateController } from './estimate.controller';
import { EstimateService } from './estimate.service';

@Module({
  imports: [PrismaModule],
  controllers: [EstimateController],
  providers: [EstimateService],
})
export class EstimateModule {}
