import { Module } from '@nestjs/common';
import { PrismaModule } from 'prisma/prisma.module';
import { UnitService } from './unit.service';
import { UnitController, PublicUnitController } from './unit.controller';

@Module({
  imports: [PrismaModule],
  providers: [UnitService],
  controllers: [PublicUnitController, UnitController],
})
export class UnitModule {}
