import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@ApiTags('Catalog')
@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get()
  @ApiOperation({ summary: 'Get category tree' })
  @ApiOkResponse({
    description: 'Category tree',
    schema: {
      example: [
        {
          id: 1,
          name: 'Сухие смеси',
          slug: 'suhie-smesi',
          parentId: null,
          sortOrder: 0,
          children: [
            {
              id: 2,
              name: 'Шпаклевки',
              slug: 'shpaklevki',
              parentId: 1,
              sortOrder: 0,
              children: [],
            },
          ],
        },
      ],
    },
  })
  findAllTree() {
    return this.categoryService.findAllTree();
  }
}

@ApiTags('Admin / Categories')
@Controller('admin/categories')
export class AdminCategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  @ApiOperation({ summary: 'Create category' })
  @ApiOkResponse({
    description: 'Created category',
    schema: {
      example: {
        id: 1,
        name: 'Сухие смеси',
        slug: 'suhie-smesi',
        parentId: null,
        isActive: true,
        sortOrder: 0,
        createdAt: '2026-03-13T17:39:01.758Z',
        updatedAt: '2026-03-13T17:39:01.758Z',
      },
    },
  })
  create(@Body() dto: CreateCategoryDto) {
    return this.categoryService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List categories' })
  @ApiOkResponse({
    description: 'Categories list',
    schema: {
      example: [
        {
          id: 1,
          name: 'Сухие смеси',
          slug: 'suhie-smesi',
          parentId: null,
          isActive: true,
          sortOrder: 0,
        },
      ],
    },
  })
  findAll() {
    return this.categoryService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get category by id' })
  @ApiParam({ name: 'id', example: 1 })
  @ApiNotFoundResponse({ description: 'Category not found' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.categoryService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update category' })
  @ApiParam({ name: 'id', example: 1 })
  @ApiNotFoundResponse({ description: 'Category not found' })
  @ApiBadRequestResponse({ description: 'Category cannot be its own parent' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCategoryDto) {
    return this.categoryService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete category' })
  @ApiParam({ name: 'id', example: 1 })
  @ApiBadRequestResponse({ description: 'Category has child categories or products' })
  @ApiNotFoundResponse({ description: 'Category not found' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.categoryService.remove(id);
  }
}
