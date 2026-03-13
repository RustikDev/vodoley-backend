import { Module } from '@nestjs/common';
import { PrismaModule } from 'prisma/prisma.module';
import { UnitService } from './unit.service';
import { UnitController } from './unit.controller';

@Module({
  imports: [PrismaModule],
  providers: [UnitService],
  controllers: [UnitController],
})
export class UnitModule {}
