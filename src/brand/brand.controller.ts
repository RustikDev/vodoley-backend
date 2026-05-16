import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { randomUUID } from 'node:crypto';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { BrandService } from './brand.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { BrandProductsQueryDto } from './dto/brand-products-query.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { STORAGE_SERVICE, StorageService } from '../storage/storage.service';

// ──────────────────────────────────────────────────────────────────────────────
// Public
// ──────────────────────────────────────────────────────────────────────────────

@ApiTags('Catalog')
@Controller('brands')
export class BrandController {
  constructor(private readonly brandService: BrandService) {}

  @Get()
  @ApiOperation({ summary: 'List all active brands with stats' })
  @ApiOkResponse({
    schema: {
      example: [
        {
          id: 1,
          name: 'Knauf',
          slug: 'knauf',
          description: 'Немецкий производитель',
          logo: '/uploads/knauf-logo.png',
          website: 'https://knauf.com',
          sortOrder: 0,
          productCount: 42,
          categoryCount: 5,
        },
      ],
    },
  })
  findAll() {
    return this.brandService.findAll();
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get brand by slug' })
  @ApiParam({ name: 'slug', example: 'knauf' })
  @ApiNotFoundResponse({ description: 'Brand not found' })
  findOne(@Param('slug') slug: string) {
    return this.brandService.findBySlug(slug);
  }

  @Get(':slug/products')
  @ApiOperation({ summary: 'Get brand products (paginated, filterable)' })
  @ApiParam({ name: 'slug', example: 'knauf' })
  @ApiNotFoundResponse({ description: 'Brand not found' })
  findProducts(@Param('slug') slug: string, @Query() query: BrandProductsQueryDto) {
    return this.brandService.findBrandProducts(slug, query);
  }

  @Get(':slug/categories')
  @ApiOperation({ summary: 'Get categories that have products of this brand' })
  @ApiParam({ name: 'slug', example: 'knauf' })
  @ApiNotFoundResponse({ description: 'Brand not found' })
  findCategories(@Param('slug') slug: string) {
    return this.brandService.findBrandCategories(slug);
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// Admin
// ──────────────────────────────────────────────────────────────────────────────

@ApiTags('Admin / Brands')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('admin/brands')
export class AdminBrandController {
  constructor(
    private readonly brandService: BrandService,
    @Inject(STORAGE_SERVICE) private readonly storage: StorageService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create brand' })
  @ApiOkResponse({
    schema: {
      example: {
        id: 1,
        name: 'Knauf',
        slug: 'knauf',
        description: null,
        logo: null,
        website: null,
        isActive: true,
        sortOrder: 0,
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      },
    },
  })
  @ApiBadRequestResponse({ description: 'Slug already taken or validation error' })
  create(@Body() dto: CreateBrandDto) {
    return this.brandService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all brands with stats (admin)' })
  findAll() {
    return this.brandService.findAllAdmin();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get brand by id (admin)' })
  @ApiParam({ name: 'id', example: 1 })
  @ApiNotFoundResponse({ description: 'Brand not found' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.brandService.findOneAdmin(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update brand' })
  @ApiParam({ name: 'id', example: 1 })
  @ApiNotFoundResponse({ description: 'Brand not found' })
  @ApiBadRequestResponse({ description: 'Validation error or slug conflict' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateBrandDto) {
    return this.brandService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete brand (fails if brand has products)' })
  @ApiParam({ name: 'id', example: 1 })
  @ApiNotFoundResponse({ description: 'Brand not found' })
  @ApiBadRequestResponse({ description: 'Brand has products — unlink first' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.brandService.remove(id);
  }

  @Post(':id/logo')
  @ApiOperation({ summary: 'Upload brand logo' })
  @ApiParam({ name: 'id', example: 1 })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { file: { type: 'string', format: 'binary' } },
      required: ['file'],
    },
  })
  @ApiBadRequestResponse({ description: 'File is required' })
  @ApiNotFoundResponse({ description: 'Brand not found' })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  async uploadLogo(@Param('id', ParseIntPipe) id: number, @UploadedFile() file: any) {
    if (!file) throw new BadRequestException('File is required');
    const ext = file.originalname.split('.').pop() || 'bin';
    const filename = `${randomUUID()}.${ext}`;
    const url = await this.storage.save(file.buffer, filename, file.mimetype);
    return this.brandService.updateLogo(id, url);
  }

  @Delete(':id/logo')
  @ApiOperation({ summary: 'Remove brand logo' })
  @ApiParam({ name: 'id', example: 1 })
  @ApiNotFoundResponse({ description: 'Brand not found' })
  removeLogo(@Param('id', ParseIntPipe) id: number) {
    return this.brandService.updateLogo(id, null);
  }
}
