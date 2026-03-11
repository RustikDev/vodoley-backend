/* eslint-disable @typescript-eslint/no-unsafe-call */

import {
  IsBoolean,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

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
}
