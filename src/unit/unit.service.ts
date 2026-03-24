import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateUnitDto } from './dto/create-unit.dto';
import { UpdateUnitDto } from './dto/update-unit.dto';
import { InMemoryCacheService } from '../common/cache/in-memory-cache.service';

@Injectable()
export class UnitService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: InMemoryCacheService,
  ) {}

  private async invalidateCatalogCache() {
    await this.cache.clearByPrefix('products:list:');
  }

  async create(dto: CreateUnitDto) {
    const created = await this.prisma.unit.create({ data: dto });
    await this.invalidateCatalogCache();
    return created;
  }

  async findAll() {
    return this.prisma.unit.findMany({
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    });
  }

  async findOne(id: number) {
    const unit = await this.prisma.unit.findUnique({ where: { id } });
    if (!unit) throw new NotFoundException(`Unit with id ${id} not found`);
    return unit;
  }

  async update(id: number, dto: UpdateUnitDto) {
    await this.findOne(id);
    const updated = await this.prisma.unit.update({ where: { id }, data: dto });
    await this.invalidateCatalogCache();
    return updated;
  }

  async remove(id: number) {
    await this.findOne(id);
    const productsCount = await this.prisma.product.count({
      where: { unitId: id },
    });
    if (productsCount > 0) {
      throw new BadRequestException('Unit is used by products');
    }
    const deleted = await this.prisma.unit.delete({ where: { id } });
    await this.invalidateCatalogCache();
    return deleted;
  }
}
