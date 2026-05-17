import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { InMemoryCacheService } from '../common/cache/in-memory-cache.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { BrandProductsQueryDto } from './dto/brand-products-query.dto';
import { Prisma } from 'src/generated/prisma/client';

@Injectable()
export class BrandService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: InMemoryCacheService,
  ) {}

  private async invalidateBrandCache() {
    await this.cache.clearByPrefix('brands:');
    await this.cache.clearByPrefix('products:list:');
  }

  // ────────────────────────────────────────────────────────────────
  // Admin CRUD
  // ────────────────────────────────────────────────────────────────

  async create(dto: CreateBrandDto) {
    const existing = await this.prisma.brand.findUnique({ where: { slug: dto.slug } });
    if (existing) throw new BadRequestException(`Brand with slug "${dto.slug}" already exists`);

    const brand = await this.prisma.brand.create({ data: dto });
    await this.invalidateBrandCache();
    return brand;
  }

  async findAllAdmin() {
    const brands = await this.prisma.brand.findMany({
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      include: {
        _count: { select: { products: true } },
      },
    });

    return this.attachCategoryCount(brands);
  }

  async findOneAdmin(id: number) {
    const brand = await this.prisma.brand.findUnique({
      where: { id },
      include: { _count: { select: { products: true } } },
    });
    if (!brand) throw new NotFoundException(`Brand with id ${id} not found`);

    const [withCount] = await this.attachCategoryCount([brand]);
    return withCount;
  }

  async update(id: number, dto: UpdateBrandDto) {
    await this.findOneAdmin(id);

    if (dto.slug) {
      const conflict = await this.prisma.brand.findFirst({
        where: { slug: dto.slug, id: { not: id } },
      });
      if (conflict) throw new BadRequestException(`Brand with slug "${dto.slug}" already exists`);
    }

    const updated = await this.prisma.brand.update({ where: { id }, data: dto });
    await this.invalidateBrandCache();
    return updated;
  }

  async remove(id: number) {
    await this.findOneAdmin(id);

    const productsCount = await this.prisma.product.count({ where: { brandId: id } });
    if (productsCount > 0) {
      throw new BadRequestException(
        `Brand has ${productsCount} product(s). Unlink them before deleting.`,
      );
    }

    const deleted = await this.prisma.brand.delete({ where: { id } });
    await this.invalidateBrandCache();
    return deleted;
  }

  async updateLogo(id: number, logo: string | null) {
    await this.findOneAdmin(id);
    const updated = await this.prisma.brand.update({ where: { id }, data: { logo } });
    await this.invalidateBrandCache();
    return updated;
  }

  // ────────────────────────────────────────────────────────────────
  // Public
  // ────────────────────────────────────────────────────────────────

  async findAll() {
    const cacheKey = 'brands:list:active';
    const cached = await this.cache.get<unknown[]>(cacheKey);
    if (cached) return cached;

    const brands = await this.prisma.brand.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        logo: true,
        website: true,
        sortOrder: true,
        _count: { select: { products: { where: { isActive: true } } } },
      },
    });

    const result = await this.attachCategoryCount(brands, true);
    await this.cache.set(cacheKey, result, 60_000);
    return result;
  }

  async findBySlug(slug: string) {
    const cacheKey = `brands:slug:${slug}`;
    const cached = await this.cache.get<unknown>(cacheKey);
    if (cached) return cached;

    const brand = await this.prisma.brand.findUnique({
      where: { slug, isActive: true },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        logo: true,
        website: true,
        sortOrder: true,
        _count: { select: { products: { where: { isActive: true } } } },
      },
    });
    if (!brand) throw new NotFoundException(`Brand "${slug}" not found`);

    const [result] = await this.attachCategoryCount([brand], true);
    await this.cache.set(cacheKey, result, 60_000);
    return result;
  }

  async findBrandProducts(slug: string, query: BrandProductsQueryDto) {
    const brand = await this.prisma.brand.findUnique({
      where: { slug, isActive: true },
      select: { id: true },
    });
    if (!brand) throw new NotFoundException(`Brand "${slug}" not found`);

    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const skip = (page - 1) * pageSize;

    const where: Prisma.ProductWhereInput = {
      brandId: brand.id,
      isActive: true,
    };

    if (query.q) {
      where.OR = [
        { name: { contains: query.q } },
        { description: { contains: query.q } },
      ];
    }

    if (query.categoryId) {
      where.categoryId = query.categoryId;
    }

    if (query.minPrice !== undefined || query.maxPrice !== undefined) {
      const price: Prisma.DecimalFilter = {};
      if (query.minPrice !== undefined) price.gte = query.minPrice;
      if (query.maxPrice !== undefined) price.lte = query.maxPrice;
      where.price = price;
    }

    if (query.status !== undefined) {
      where.inventory = { is: { status: query.status } };
    }

    let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: 'desc' };
    if (query.sort === 'price_asc') orderBy = { price: 'asc' };
    if (query.sort === 'price_desc') orderBy = { price: 'desc' };
    if (query.sort === 'newest') orderBy = { createdAt: 'desc' };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: pageSize,
        include: {
          images: { orderBy: { sortOrder: 'asc' } },
          unit: true,
          category: true,
          inventory: true,
          brand: { select: { id: true, name: true, slug: true, logo: true } },
        },
      }),
      this.prisma.product.count({ where }),
    ]);

    return { items, total, page, pageSize };
  }

  async findBrandCategories(slug: string) {
    const brand = await this.prisma.brand.findUnique({
      where: { slug, isActive: true },
      select: { id: true },
    });
    if (!brand) throw new NotFoundException(`Brand "${slug}" not found`);

    const categories = await this.prisma.category.findMany({
      where: {
        isActive: true,
        products: { some: { brandId: brand.id, isActive: true } },
      },
      select: {
        id: true,
        name: true,
        slug: true,
        parentId: true,
        sortOrder: true,
        _count: { select: { products: { where: { brandId: brand.id, isActive: true } } } },
      },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    });

    return categories.map((c) => ({
      ...c,
      productCount: c._count.products,
      _count: undefined,
    }));
  }

  // ────────────────────────────────────────────────────────────────
  // Helpers
  // ────────────────────────────────────────────────────────────────

  private async attachCategoryCount<
    T extends { id?: number; _count?: { products: number } },
  >(brands: T[], onlyActive = false): Promise<(T & { productCount: number; categoryCount: number })[]> {
    if (!brands.length) return [];

    const ids = brands.map((b) => (b as any).id as number);

    const rows = await this.prisma.product.groupBy({
      by: ['brandId', 'categoryId'],
      where: {
        brandId: { in: ids },
        ...(onlyActive ? { isActive: true } : {}),
      },
      _count: true,
    });

    const categoryCountByBrand = new Map<number, number>();
    const productCountByBrand = new Map<number, number>();

    for (const row of rows) {
      const bid = row.brandId!;
      categoryCountByBrand.set(bid, (categoryCountByBrand.get(bid) ?? 0) + 1);
      productCountByBrand.set(bid, (productCountByBrand.get(bid) ?? 0) + row._count);
    }

    return brands.map((b) => {
      const bid = (b as any).id as number;
      const { _count, ...rest } = b as any;
      return {
        ...rest,
        productCount: productCountByBrand.get(bid) ?? 0,
        categoryCount: categoryCountByBrand.get(bid) ?? 0,
      };
    });
  }
}
