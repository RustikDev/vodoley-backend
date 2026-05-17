import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { google } from 'googleapis';
import { PrismaService } from 'prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { OrderQueryDto } from './dto/order-query.dto';

@Injectable()
export class OrderService {
  private readonly logger = new Logger(OrderService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  async create(dto: CreateOrderDto): Promise<{ id: number }> {
    const order = await this.prisma.order.create({
      data: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: dto.phone,
        delivery: dto.delivery,
        address: dto.address ?? null,
        totalAmount: dto.totalAmount,
        items: {
          create: dto.items.map((item) => ({
            productId: item.productId,
            name: item.name,
            unit: item.unit,
            quantity: item.quantity,
            price: item.price,
            total: item.total,
          })),
        },
      },
    });

    this.appendToSheet(order.id, dto).catch((err) =>
      this.logger.error('Google Sheets append failed', err),
    );

    return { id: order.id };
  }

  async findAll(query: OrderQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (query.search) {
      const s = query.search.trim();
      where.OR = [
        { phone: { contains: s } },
        { firstName: { contains: s } },
        { lastName: { contains: s } },
      ];
    }

    if (query.delivery !== undefined) {
      where.delivery = query.delivery;
    }

    const sortBy = query.sortBy ?? 'createdAt';
    const sortOrder = query.sortOrder ?? 'desc';

    const [total, items] = await Promise.all([
      this.prisma.order.count({ where }),
      this.prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: { items: true },
      }),
    ]);

    return {
      data: items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!order) throw new NotFoundException(`Order #${id} not found`);

    return order;
  }

  async update(id: number, dto: UpdateOrderDto) {
    await this.findOne(id);

    return this.prisma.order.update({
      where: { id },
      data: dto,
      include: { items: true },
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    await this.prisma.order.delete({ where: { id } });

    return { id };
  }

  private async appendToSheet(orderId: number, dto: CreateOrderDto) {
    const credentialsPath = this.config.get<string>('GOOGLE_CREDENTIALS_PATH');
    const sheetId = this.config.get<string>('GOOGLE_SHEET_ID');

    if (!credentialsPath || !sheetId) {
      this.logger.warn('Google Sheets not configured, skipping');
      return;
    }

    const auth = new google.auth.GoogleAuth({
      keyFile: credentialsPath,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    const date = new Date().toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' });
    const itemsSummary = dto.items
      .map((i) => `${i.name} × ${i.quantity} ${i.unit}`)
      .join(', ');

    const row = [
      orderId,
      date,
      `${dto.lastName} ${dto.firstName}`,
      dto.phone,
      dto.delivery ? 'Да' : 'Нет',
      dto.address ?? '',
      itemsSummary,
      dto.totalAmount,
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: 'Заказы!A:H',
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [row] },
    });
  }
}
