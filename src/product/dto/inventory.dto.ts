import { IsEnum, IsInt, IsOptional, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export enum InventoryStatus {
  IN_STOCK = 'IN_STOCK',
  OUT_OF_STOCK = 'OUT_OF_STOCK',
  ON_ORDER = 'ON_ORDER',
}

export const INVENTORY_STATUS_LABELS: Record<InventoryStatus, string> = {
  [InventoryStatus.IN_STOCK]: 'В наличии',
  [InventoryStatus.OUT_OF_STOCK]: 'Нет в наличии',
  [InventoryStatus.ON_ORDER]: 'Под заказ',
};

export function withStatusLabel<T extends { status: InventoryStatus | string } | null>(
  inventory: T,
): T extends null ? null : T & { statusLabel: string } {
  if (!inventory) return null as any;
  return {
    ...inventory,
    statusLabel: INVENTORY_STATUS_LABELS[inventory.status as InventoryStatus] ?? inventory.status,
  } as any;
}

export class UpdateInventoryDto {
  @ApiPropertyOptional({ example: 120 })
  @IsOptional()
  @IsInt()
  @Min(0)
  quantity?: number;

  @ApiPropertyOptional({ example: InventoryStatus.IN_STOCK })
  @IsOptional()
  @IsEnum(InventoryStatus)
  status?: InventoryStatus;
}
