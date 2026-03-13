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
} from 'class-validator';
import { Type } from 'class-transformer';
import { InventoryStatus, UpdateInventoryDto } from './inventory.dto';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProductImageDto {
  @ApiProperty({ example: 'https://example.com/img.jpg' })
  @IsString()
  url: string;

  @ApiPropertyOptional({ example: 'Главное фото' })
  @IsOptional()
  @IsString()
  alt?: string;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isMain?: boolean;
}

export class CreateInventoryDto extends UpdateInventoryDto {}

export class CreateProductDto {
  @ApiProperty({ example: 'Цемент М500' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'cement-m500' })
  @IsString()
  slug: string;

  @ApiPropertyOptional({ example: 'Прочный цемент' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 350.5 })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  categoryId: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  unitId: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ type: [CreateProductImageDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProductImageDto)
  images?: CreateProductImageDto[];

  @ApiPropertyOptional({
    example: { quantity: 120, status: InventoryStatus.IN_STOCK },
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateInventoryDto)
  inventory?: CreateInventoryDto;
}
