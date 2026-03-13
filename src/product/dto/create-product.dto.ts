/* eslint-disable @typescript-eslint/no-unsafe-call */

import {
  IsArray,
  IsBoolean,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum InventoryStatus {
  IN_STOCK = 'IN_STOCK',
  OUT_OF_STOCK = 'OUT_OF_STOCK',
  ON_ORDER = 'ON_ORDER',
}

export class CreateProductImageDto {
  @IsString()
  url: string;

  @IsOptional()
  @IsString()
  alt?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  isMain?: boolean;
}

export class CreateInventoryDto {
  @IsOptional()
  @IsInt()
  @Min(0)
  quantity?: number;

  @IsOptional()
  @IsEnum(InventoryStatus)
  status?: InventoryStatus;
}

export class CreateProductDto {
  @IsString()
  name: string;

  @IsString()
  slug: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsInt()
  categoryId: number;

  @IsInt()
  unitId: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProductImageDto)
  images?: CreateProductImageDto[];

  @IsOptional()
  @ValidateNested()
  @Type(() => CreateInventoryDto)
  inventory?: CreateInventoryDto;
}
