import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { randomUUID } from 'node:crypto';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { UpdateInventoryDto } from './dto/inventory.dto';
import { Inject } from '@nestjs/common';
import { STORAGE_SERVICE, StorageService } from '../storage/storage.service';
import { plainToInstance } from 'class-transformer';
import { validateOrReject } from 'class-validator';
import {
  ApiBody,
  ApiConsumes,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Admin / Products')
@Controller('admin/products')
export class AdminProductController {
  constructor(
    private readonly productService: ProductService,
    @Inject(STORAGE_SERVICE) private readonly storage: StorageService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create product (multipart/form-data)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Product form-data payload',
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Cement M500' },
        slug: { type: 'string', example: 'cement-m500' },
        description: { type: 'string', example: 'High strength cement' },
        price: { type: 'number', example: 350.5 },
        categoryId: { type: 'number', example: 1 },
        unitId: { type: 'number', example: 1 },
        isActive: { type: 'boolean', example: true },
        inventoryQuantity: { type: 'number', example: 120 },
        inventoryStatus: {
          type: 'string',
          example: 'IN_STOCK',
          enum: ['IN_STOCK', 'OUT_OF_STOCK', 'ON_ORDER'],
        },
        images: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
        },
      },
      required: ['name', 'slug', 'price', 'categoryId', 'unitId'],
    },
  })
  @ApiOkResponse({
    description: 'Created product',
    schema: {
      example: {
        id: 1,
        name: 'Cement M500',
        slug: 'cement-m500',
        description: 'High strength cement',
        price: 350.5,
        isActive: true,
        categoryId: 1,
        unitId: 1,
        images: [],
        inventory: { quantity: 120, status: 'IN_STOCK' },
      },
    },
  })
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'images', maxCount: 10 },
        { name: 'images[]', maxCount: 10 },
      ],
      {
        storage: memoryStorage(),
        limits: { fileSize: 5 * 1024 * 1024 },
      },
    ),
  )
  async createForm(
    @Body() body: any,
    @UploadedFiles() files: { images?: any[]; 'images[]'?: any[] },
  ) {
    const toBool = (v: any) =>
      v === undefined ? undefined : v === 'true' || v === true;

    const payload = {
      name: body.name,
      slug: body.slug,
      description: body.description,
      price: body.price !== undefined ? Number(body.price) : undefined,
      categoryId: body.categoryId ? Number(body.categoryId) : undefined,
      unitId: body.unitId ? Number(body.unitId) : undefined,
      isActive: toBool(body.isActive),
      inventory:
        body.inventoryQuantity !== undefined || body.inventoryStatus
          ? {
              quantity:
                body.inventoryQuantity !== undefined
                  ? Number(body.inventoryQuantity)
                  : undefined,
              status: body.inventoryStatus,
            }
          : undefined,
      images: [],
    };

    const instance = plainToInstance(CreateProductDto, payload);
    await validateOrReject(instance);
    const dto = instance as CreateProductDto;

    const imageFiles = [
      ...(files?.images ?? []),
      ...(files?.['images[]'] ?? []),
    ];

    if (imageFiles.length) {
      for (const file of imageFiles) {
        const ext = file.originalname.split('.').pop() || 'bin';
        const filename = `${randomUUID()}.${ext}`;
        const url = await this.storage.save(file.buffer, filename, file.mimetype);
        dto.images!.push({
          url,
          alt: file.originalname,
          isMain: false,
          sortOrder: 0,
        });
      }
    }

    return this.productService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List products (admin)' })
  @ApiOkResponse({
    description: 'Products list',
    schema: {
      example: [
        {
          id: 1,
          name: 'Cement M500',
          slug: 'cement-m500',
          description: 'High strength cement',
          price: 350.5,
          isActive: true,
          categoryId: 1,
          unitId: 1,
          images: [],
          inventory: { quantity: 120, status: 'IN_STOCK' },
        },
      ],
    },
  })
  findAll() {
    return this.productService.findAllAdmin();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product by id (admin)' })
  @ApiParam({ name: 'id', example: 1 })
  @ApiOkResponse({
    description: 'Product detail',
    schema: {
      example: {
        id: 1,
        name: 'Cement M500',
        slug: 'cement-m500',
        description: 'High strength cement',
        price: 350.5,
        isActive: true,
        categoryId: 1,
        unitId: 1,
        images: [],
        inventory: { quantity: 120, status: 'IN_STOCK' },
      },
    },
  })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update product' })
  @ApiParam({ name: 'id', example: 1 })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateProductDto) {
    return this.productService.update(id, dto);
  }

  @Get(':id/inventory')
  @ApiOperation({ summary: 'Get inventory by product id' })
  @ApiParam({ name: 'id', example: 1 })
  getInventory(@Param('id', ParseIntPipe) id: number) {
    return this.productService.getInventory(id);
  }

  @Patch(':id/inventory')
  @ApiOperation({ summary: 'Update inventory by product id' })
  @ApiParam({ name: 'id', example: 1 })
  updateInventory(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateInventoryDto,
  ) {
    return this.productService.updateInventory(id, dto);
  }

  @Post(':id/images')
  @ApiOperation({ summary: 'Upload product image' })
  @ApiParam({ name: 'id', example: 1 })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  async uploadImage(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: any,
  ) {
    if (!file) {
      throw new BadRequestException('File is required');
    }
    const ext = file.originalname.split('.').pop() || 'bin';
    const filename = `${randomUUID()}.${ext}`;
    const url = await this.storage.save(file.buffer, filename, file.mimetype);
    return this.productService.addImage(id, {
      url,
      alt: file.originalname,
      isMain: false,
      sortOrder: 0,
    });
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete product' })
  @ApiParam({ name: 'id', example: 1 })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.productService.remove(id);
  }
}
