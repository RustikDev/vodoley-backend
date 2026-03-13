import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
  ApiNotFoundResponse,
} from '@nestjs/swagger';
import { ProductService } from './product.service';
import { ProductQueryDto } from './dto/product-query.dto';

@ApiTags('Catalog')
@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  @ApiOperation({ summary: 'List products (public)' })
  @ApiQuery({ name: 'q', required: false })
  @ApiQuery({ name: 'categoryId', required: false })
  @ApiQuery({ name: 'includeChildren', required: false })
  @ApiQuery({ name: 'unitId', required: false })
  @ApiQuery({ name: 'minPrice', required: false })
  @ApiQuery({ name: 'maxPrice', required: false })
  @ApiQuery({ name: 'inStock', required: false })
  @ApiQuery({ name: 'sort', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'pageSize', required: false })
  @ApiOkResponse({
    description: 'Paginated products list',
    schema: {
      example: {
        items: [
          {
            id: 1,
            name: 'Цемент М500',
            slug: 'cement-m500',
            description: 'Прочный цемент',
            price: 350.5,
            isActive: true,
            categoryId: 1,
            unitId: 1,
            images: [],
            inventory: { quantity: 120, status: 'IN_STOCK' },
          },
        ],
        total: 1,
        page: 1,
        pageSize: 20,
      },
    },
  })
  findAll(@Query() query: ProductQueryDto) {
    return this.productService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product by id (public)' })
  @ApiParam({ name: 'id', example: 1 })
  @ApiOkResponse({
    description: 'Product detail',
    schema: {
      example: {
        id: 1,
        name: 'Цемент М500',
        slug: 'cement-m500',
        description: 'Прочный цемент',
        price: 350.5,
        isActive: true,
        categoryId: 1,
        unitId: 1,
        images: [],
        inventory: { quantity: 120, status: 'IN_STOCK' },
      },
    },
  })
  @ApiNotFoundResponse({ description: 'Product not found' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productService.findOne(id);
  }

  @Get(':id/recommendations')
  @ApiOperation({ summary: 'Get recommendations by product id' })
  @ApiParam({ name: 'id', example: 1 })
  recommendations(@Param('id', ParseIntPipe) id: number) {
    return this.productService.getRecommendations(id);
  }
}
