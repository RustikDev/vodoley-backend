import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductQueryDto } from './dto/product-query.dto';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  findAll(@Query() query: ProductQueryDto) {
    return this.productService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productService.findOne(id);
  }

  @Get(':id/recommendations')
  recommendations(@Param('id', ParseIntPipe) id: number) {
    return this.productService.getRecommendations(id);
  }
}
