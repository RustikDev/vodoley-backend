import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { InMemoryCacheService } from '../common/cache/in-memory-cache.service';

export type CategoryNode = {
  id: number;
  name: string;
  slug: string;
  parentId: number | null;
  sortOrder: number;
  children: CategoryNode[];
};

@Injectable()
export class CategoryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: InMemoryCacheService,
  ) {}

  private async invalidateCatalogCache() {
    await this.cache.clearByPrefix('categories:');
    await this.cache.clearByPrefix('products:list:');
  }

  async create(dto: CreateCategoryDto) {
    if (dto.parentId) {
      const parent = await this.prisma.category.findUnique({
        where: { id: dto.parentId },
      });
      if (!parent) throw new NotFoundException('Parent category not found');
    }

    const created = await this.prisma.category.create({ data: dto });
    await this.invalidateCatalogCache();
    return created;
  }

  async findAll() {
    return this.prisma.category.findMany({
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    });
  }

  async findAllTree(): Promise<CategoryNode[]> {
    const cacheKey = 'categories:tree:active';
    const cached = await this.cache.get<CategoryNode[]>(cacheKey);
    if (cached) return cached;

    const categories = await this.prisma.category.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      select: {
        id: true,
        name: true,
        slug: true,
        parentId: true,
        sortOrder: true,
      },
    });

    const byId = new Map<number, CategoryNode>();
    const roots: CategoryNode[] = [];

    for (const c of categories) {
      byId.set(c.id, { ...c, parentId: c.parentId ?? null, children: [] });
    }

    for (const node of byId.values()) {
      if (node.parentId && byId.has(node.parentId)) {
        byId.get(node.parentId)!.children.push(node);
      } else {
        roots.push(node);
      }
    }

    await this.cache.set(cacheKey, roots, 60_000);
    return roots;
  }

  async findOne(id: number) {
    const category = await this.prisma.category.findUnique({ where: { id } });
    if (!category) throw new NotFoundException(`Category with id ${id} not found`);
    return category;
  }

  async update(id: number, dto: UpdateCategoryDto) {
    await this.findOne(id);

    if (dto.parentId !== undefined) {
      if (dto.parentId === id) {
        throw new BadRequestException('Category cannot be its own parent');
      }
      if (dto.parentId) {
        const parent = await this.prisma.category.findUnique({
          where: { id: dto.parentId },
        });
        if (!parent) throw new NotFoundException('Parent category not found');
      }
    }

    const updated = await this.prisma.category.update({ where: { id }, data: dto });
    await this.invalidateCatalogCache();
    return updated;
  }

  async remove(id: number) {
    await this.findOne(id);

    const [childrenCount, productsCount] = await this.prisma.$transaction([
      this.prisma.category.count({ where: { parentId: id } }),
      this.prisma.product.count({ where: { categoryId: id } }),
    ]);

    if (childrenCount > 0) {
      throw new BadRequestException('Category has child categories');
    }
    if (productsCount > 0) {
      throw new BadRequestException('Category has products');
    }

    const deleted = await this.prisma.category.delete({ where: { id } });
    await this.invalidateCatalogCache();
    return deleted;
  }
}
