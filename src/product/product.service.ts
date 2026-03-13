import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductQueryDto } from './dto/product-query.dto';
import { Prisma } from 'src/generated/prisma/client';
import { UpdateInventoryDto } from './dto/inventory.dto';

@Injectable()
export class ProductService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createProductDto: CreateProductDto) {
    const { images, inventory, ...data } = createProductDto;

    return await this.prisma.product.create({
      data: {
        ...data,
        images: images ? { create: images } : undefined,
        inventory: inventory ? { create: inventory } : undefined,
      },
      include: {
        images: { orderBy: { sortOrder: 'asc' } },
        unit: true,
        category: true,
        inventory: true,
      },
    });
  }

  async findAll(query: ProductQueryDto) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const skip = (page - 1) * pageSize;

    const where: Prisma.ProductWhereInput = {
      isActive: true,
    };

    if (query.q) {
      // MySQL uses collation for case sensitivity, so no "mode: insensitive"
      where.OR = [
        { name: { contains: query.q } },
        { description: { contains: query.q } },
      ];
    }

    if (query.categoryId) {
      where.categoryId = query.categoryId;
    }

    if (query.unitId) {
      where.unitId = query.unitId;
    }

    if (query.minPrice !== undefined || query.maxPrice !== undefined) {
      const price: Prisma.DecimalFilter = {};
      if (query.minPrice !== undefined) price.gte = query.minPrice;
      if (query.maxPrice !== undefined) price.lte = query.maxPrice;
      where.price = price;
    }

    if (query.inStock === true) {
      where.inventory = {
        is: {
          quantity: { gt: 0 },
          status: 'IN_STOCK',
        },
      };
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
        },
      }),
      this.prisma.product.count({ where }),
    ]);

    return { items, total, page, pageSize };
  }

  async findAllAdmin() {
    return await this.prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        images: { orderBy: { sortOrder: 'asc' } },
        unit: true,
        category: true,
        inventory: true,
      },
    });
  }

  async findOne(id: number) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        images: { orderBy: { sortOrder: 'asc' } },
        unit: true,
        category: true,
        inventory: true,
      },
    });
    if (!product)
      throw new NotFoundException(`Product with id ${id} not found`);
    return product;
  }

  async getRecommendations(id: number) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      select: { id: true, categoryId: true },
    });
    if (!product)
      throw new NotFoundException(`Product with id ${id} not found`);

    return await this.prisma.product.findMany({
      where: {
        isActive: true,
        categoryId: product.categoryId,
        id: { not: product.id },
      },
      orderBy: { createdAt: 'desc' },
      take: 6,
      include: {
        images: { orderBy: { sortOrder: 'asc' } },
        unit: true,
        category: true,
        inventory: true,
      },
    });
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    await this.findOne(id);

    const { images, inventory, ...data } = updateProductDto as CreateProductDto;

    return await this.prisma.$transaction(async (tx) => {
      if (images) {
        await tx.productImage.deleteMany({ where: { productId: id } });
        if (images.length > 0) {
          await tx.productImage.createMany({
            data: images.map((img) => ({ ...img, productId: id })),
          });
        }
      }

      if (inventory) {
        await tx.inventory.upsert({
          where: { productId: id },
          create: { ...inventory, productId: id },
          update: inventory,
        });
      }

      return tx.product.update({
        where: { id },
        data,
        include: {
          images: { orderBy: { sortOrder: 'asc' } },
          unit: true,
          category: true,
          inventory: true,
        },
      });
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return await this.prisma.$transaction(async (tx) => {
      await tx.productImage.deleteMany({ where: { productId: id } });
      await tx.inventory.deleteMany({ where: { productId: id } });
      return tx.product.delete({ where: { id } });
    });
  }

  async getInventory(id: number) {
    await this.findOne(id);
    return this.prisma.inventory.findUnique({ where: { productId: id } });
  }

  async updateInventory(id: number, dto: UpdateInventoryDto) {
    await this.findOne(id);
    return this.prisma.inventory.upsert({
      where: { productId: id },
      create: { ...dto, productId: id },
      update: dto,
    });
  }

  async addImage(
    id: number,
    image: { url: string; alt?: string; isMain?: boolean; sortOrder?: number },
  ) {
    await this.findOne(id);
    return this.prisma.productImage.create({
      data: { ...image, productId: id },
    });
  }
}
