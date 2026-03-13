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
import { UnitService } from './unit.service';
import { CreateUnitDto } from './dto/create-unit.dto';
import { UpdateUnitDto } from './dto/update-unit.dto';

@ApiTags('Admin / Units')
@Controller('admin/units')
export class UnitController {
  constructor(private readonly unitService: UnitService) {}

  @Post()
  @ApiOperation({ summary: 'Create unit' })
  @ApiOkResponse({
    description: 'Created unit',
    schema: {
      example: {
        id: 1,
        name: 'Килограмм',
        shortName: 'кг',
        isActive: true,
        sortOrder: 0,
      },
    },
  })
  create(@Body() dto: CreateUnitDto) {
    return this.unitService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List units' })
  @ApiOkResponse({
    description: 'Units list',
    schema: {
      example: [
        { id: 1, name: 'Килограмм', shortName: 'кг', isActive: true, sortOrder: 0 },
      ],
    },
  })
  findAll() {
    return this.unitService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get unit by id' })
  @ApiParam({ name: 'id', example: 1 })
  @ApiNotFoundResponse({ description: 'Unit not found' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.unitService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update unit' })
  @ApiParam({ name: 'id', example: 1 })
  @ApiNotFoundResponse({ description: 'Unit not found' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateUnitDto) {
    return this.unitService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete unit' })
  @ApiParam({ name: 'id', example: 1 })
  @ApiBadRequestResponse({ description: 'Unit is used by products' })
  @ApiNotFoundResponse({ description: 'Unit not found' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.unitService.remove(id);
  }
}
