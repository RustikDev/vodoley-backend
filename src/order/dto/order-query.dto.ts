import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class OrderQueryDto {
  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ example: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 20;

  @ApiPropertyOptional({ example: '+79001234567', description: 'Search by phone, firstName or lastName' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ example: true, description: 'Filter by delivery flag' })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  delivery?: boolean;

  @ApiPropertyOptional({ example: 'createdAt', enum: ['createdAt', 'totalAmount', 'lastName'] })
  @IsOptional()
  @IsString()
  sortBy?: 'createdAt' | 'totalAmount' | 'lastName' = 'createdAt';

  @ApiPropertyOptional({ example: 'desc', enum: ['asc', 'desc'] })
  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc' = 'desc';
}
