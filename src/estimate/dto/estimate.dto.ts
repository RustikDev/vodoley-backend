import { Type } from 'class-transformer';
import { IsArray, IsInt, Min, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class EstimateItemDto {
  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @IsInt()
  productId: number;

  @ApiProperty({ example: 2 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  quantity: number;
}

export class EstimatePreviewDto {
  @ApiProperty({ type: [EstimateItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EstimateItemDto)
  items: EstimateItemDto[];
}
