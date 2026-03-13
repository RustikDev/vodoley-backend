import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { EstimatePreviewDto } from './dto/estimate.dto';

@Injectable()
export class EstimateService {
  constructor(private readonly prisma: PrismaService) {}

  async preview(dto: EstimatePreviewDto) {
    const productIds = dto.items.map((i) => i.productId);
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds }, isActive: true },
      include: { unit: true },
    });

    const productMap = new Map(products.map((p) => [p.id, p]));
    const items = dto.items.map((item) => {
      const product = productMap.get(item.productId);
      if (!product) {
        throw new NotFoundException(`Product ${item.productId} not found`);
      }
      const lineTotal = Number(product.price) * item.quantity;
      return {
        productId: product.id,
        name: product.name,
        unit: product.unit.shortName,
        price: Number(product.price),
        quantity: item.quantity,
        lineTotal,
      };
    });

    const total = items.reduce((sum, i) => sum + i.lineTotal, 0);
    return { items, total };
  }

}
