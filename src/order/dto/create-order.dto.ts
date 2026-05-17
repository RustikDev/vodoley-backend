import { Type } from 'class-transformer';
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
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class OrderItemDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  productId: number;

  @ApiProperty({ example: 'Цемент М500' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'кг' })
  @IsString()
  unit: string;

  @ApiProperty({ example: 10 })
  @IsInt()
  @Min(1)
  quantity: number;

  @ApiProperty({ example: 350.5 })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ example: 3505 })
  @IsNumber()
  @Min(0)
  total: number;
}

export class CreateOrderDto {
  @ApiProperty({ example: 'Иван' })
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Иванов' })
  @IsString()
  lastName: string;

  @ApiProperty({ example: '+79001234567' })
  @IsString()
  phone: string;

  @ApiProperty({ example: true })
  @IsBoolean()
  delivery: boolean;

  @ApiPropertyOptional({ example: 'г. Москва, ул. Ленина, д. 1' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ type: [OrderItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @ApiProperty({ example: 3505 })
  @IsNumber()
  @Min(0)
  totalAmount: number;
}
