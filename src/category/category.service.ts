import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';

type CategoryNode = {
  id: number;
  name: string;
  slug: string;
  parentId: number | null;
  sortOrder: number;
  children: CategoryNode[];
};

@Injectable()
export class CategoryService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllTree(): Promise<CategoryNode[]> {
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

    return roots;
  }
}
