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

@Controller('admin/products')
export class AdminProductController {
  constructor(
    private readonly productService: ProductService,
    @Inject(STORAGE_SERVICE) private readonly storage: StorageService,
  ) {}

  @Post()
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
  findAll() {
    return this.productService.findAllAdmin();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateProductDto) {
    return this.productService.update(id, dto);
  }

  @Get(':id/inventory')
  getInventory(@Param('id', ParseIntPipe) id: number) {
    return this.productService.getInventory(id);
  }

  @Patch(':id/inventory')
  updateInventory(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateInventoryDto,
  ) {
    return this.productService.updateInventory(id, dto);
  }

  @Post(':id/images')
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
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.productService.remove(id);
  }
}
